from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

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
    sql: str
    schema_str: str | None = "None"

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "Query Optic API"}

@app.post("/api/compile")
def compile_sql(payload: DesignPayload):
    # TODO: Implement Gemini compilation logic
    return {"mermaid_graph": "flowchart TD\n A-->B", "nodes_metadata": {}}
