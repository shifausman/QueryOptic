from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
import json
from dotenv import load_dotenv

try:
    from google import genai
except ImportError:
    genai = None

load_dotenv()

app = FastAPI(title="Query Optic API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DesignPayload(BaseModel):
    sql: str = Field(..., max_length=20000)
    schema_str: str | None = "None"


SYSTEM_PROMPT = """
You are a Principal SQL Data Architect.
Your task is to parse a raw SQL query and optional schema, breaking it down into logical execution steps.
You MUST output a single valid JSON object containing exactly two keys: "mermaid_graph" and "nodes_metadata".

1. "mermaid_graph": A string containing a valid Mermaid.js flowchart TD syntax.
   - Use strict chronological mapping: Base Tables -> Joins -> Subqueries -> GROUP BY -> Aggregates -> HAVING -> Window -> ORDER BY.
   - Assign strict styling (e.g. style NODE_ID fill:#e0f2fe,color:#0f172a):
     - Primary operations (Base Joins/Subqueries): Blue (#e0f2fe)
     - Heavy operations (Aggregates/Window/Group): Yellow (#fef08a)
     - Operations handling logic (WHERE/HAVING): Light Blue/Light Yellow with explicit square/circle distinctions
     - Final Operations (ORDER BY): Green (#dcfce7)
   - ALWAYS explicitly apply `,color:#0f172a` to all node styles to force dark text on the pastel backgrounds!
   - Do NOT use double quotes inside the Mermaid syntax to avoid JSON formatting issues.

2. "nodes_metadata": A dictionary where each key is a NODE_ID from the mermaid graph.
   - "title": Operation Name (Granular, e.g., "Hash Join" rather than "Join").
   - "operation_type": One of [TABLE_SCAN, JOIN, WHERE, GROUP_BY, AGGREGATE, HAVING, WINDOW, ORDER_BY, SUBQUERY].
   - "impact": "High" | "Medium" | "Low".
   - "explanation": Clear plain English description of what this logical step is doing.
   - "fix": Specific SQL optimization tip or null.

Only output the raw JSON object. Ensure no additional conversational text or markdown code blocks wrap the JSON.
"""


@app.get("/")
def health_check():
    return {"status": "healthy", "service": "Query Optic API"}


@app.post("/api/compile")
def compile_sql(payload: DesignPayload):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or len(api_key) < 10:
        raise HTTPException(status_code=400, detail="Missing or invalid GEMINI_API_KEY")

    if not genai:
        raise HTTPException(status_code=500, detail="google-genai SDK is not installed.")

    client = genai.Client(api_key=api_key)

    user_prompt = f"SQL QUERY:\n{payload.sql}\n\nSCHEMA:\n{payload.schema_str}"

    try:
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=user_prompt,
            config=genai.types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.1,
            )
        )
        
        text = response.text
        start_idx = text.find("{")
        end_idx = text.rfind("}")
        
        if start_idx == -1 or end_idx == -1:
            raise ValueError("Response does not contain valid JSON bounds.")
            
        raw_json_str = text[start_idx:end_idx+1]
        
        # Robust sanitization for trailing commas and single-line comments
        import re
        sanitized = re.sub(r'//.*?\n', '\n', raw_json_str)
        sanitized = re.sub(r',(\s*[}\]])', r'\1', sanitized)
        
        data = json.loads(sanitized)
        
        return data

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"LLM produced invalid JSON: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unknown error during compilation: {str(e)}")
