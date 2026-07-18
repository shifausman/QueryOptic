# Principal SQL Data Architect Agent

## Agent Name
**Principal SQL Data Architect**

## Purpose & Responsibilities
The Principal SQL Data Architect is the core analytical engine of the Query Optic application. Its primary responsibility is to parse and comprehend complex user-submitted SQL queries and database schemas, breaking them down into logical execution steps. It translates this analysis into a visually structured High-Level Logical Data Flow Diagram (using Mermaid.js syntax) and detailed metadata for each execution node. This simulates the query planner's behavioral steps in a human-readable format.

## When the Agent Should Be Invoked
This agent is invoked synchronously during the query analysis flow. Whenever a user submits a raw SQL query (and optional schema context) via the frontend interface, the backend `/api/compile` endpoint is triggered, invoking this agent to generate the visual roadmap and optimization insights.

## Inputs
The agent processes a structured multimodal prompt via the `DesignPayload` schema:
- `sql` (String, required): The raw SQL query string that needs to be analyzed and optimized.
- `schema` (String, optional): The corresponding database schema structure (e.g., DDL statements) to provide context for table relationships, indexes, and constraints. Default is `"None"`.

## Outputs
A continuous string representing a strictly formatted JSON object extracted from the LLM's response. The structure is:
```json
{
  "mermaid_graph": "string containing flowchart TD syntax",
  "nodes_metadata": {
    "NODE_ID": {
      "title": "Operation Name",
      "operation_type": "TABLE_SCAN | JOIN | WHERE | GROUP_BY | AGGREGATE | HAVING | WINDOW | ORDER_BY | SUBQUERY",
      "impact": "High | Medium | Low",
      "explanation": "Clear plain English description of what this logical step is doing.",
      "fix": "Specific SQL optimization tip or null"
    }
  }
}
```

## Workflow / Execution Process
1. **Request Intake:** The FastAPI backend receives the validation-passed payload on `/api/compile`.
2. **Prompt Construction:** The endpoint constructs a prompt embedding the payload's `sql` and `schema` below a very strict, robust system instruction set (`SYSTEM_PROMPT`).
3. **LLM Invocation:** Connects to Google Gemini API (`gemini-3.5-flash`) with a highly deterministic configuration (`temperature=0.1`).
4. **Response Parsing:** The agent receives the text block. To circumvent markdown markdown wrappers (e.g., ````json`), the system searches the response string for the first `{` and the last `}` to slice out the raw JSON string.
5. **JSON Decoding & Return:** The raw JSON string is parsed into Python dictionaries and served to the client payload.

## Decision Logic
The agent follows strict structural logic when mapping the data flow:
1. **Chronological Mapping:** It must flow chronologically: `Base Tables -> Joins -> Subqueries -> GROUP BY -> Aggregates -> HAVING -> Window -> ORDER BY`.
2. **Granular Operator Naming:** Must specifically name algorithms (e.g., "Hash Join" rather than generic "JOIN").
3. **Styling and Categorization:** Assigns strict styling components in Mermaid based on the node intent:
   - Primary operations (Base Joins/Subqueries): Blue (`#e0f2fe`)
   - Heavy operations (Aggregates/Window/Group): Yellow (`#fef08a`) 
   - Operations handling logic (WHERE/HAVING): Light Blue/Light Yellow with explicit square/circle distinctions
   - Final Operations (ORDER BY): Green (`#dcfce7`)

## Dependencies
- **LLM Model:** `gemini-3.5-flash` via the `google-genai` Python SDK.
- **Backend Framework:** FastAPI / Pydantic (for request validation).
- **Environment:** Requires a valid `GEMINI_API_KEY` loaded via `python-dotenv`.

## Error Handling & Recovery Strategy
- **Environment Check:** Returns an immediate `HTTP 400 (Bad Request)` if the API key is missing or invalidly short before making network calls.
- **Parsing Fallback:** If the LLM generates a response that doesn't contain curly brackets (e.g., hallucinates non-JSON text completely), a `ValueError` is raised locally. The FastAPI server handles this by catching the exception and returning an `HTTP 500 (Internal Server Error)` to the client, effectively resetting the visual state.

## Limitations
- **Single Attempt Strategy:** There is currently no retry mechanism or self-reflection loop if the Gemini response output generates invalid JSON structure (like trailing commas unhandled by standard `json.loads`).
- **Context Length:** Dependent on Gemini's token limits; excessively massive database dumps passed in the `schema` could cause token exhaustion or dilution of instruction adherence.

## Example Usage
**Request (cURL):**
```bash
curl -X POST "http://localhost:8000/api/compile" \
     -H "Content-Type: application/json" \
     -d '{"sql": "SELECT category, SUM(price) FROM products GROUP BY category;", "schema": "CREATE TABLE products (id INT, category VARCHAR, price DECIMAL);"}'
```

## Best Practices
- **Strict Typing in Prompt:** Changes to Mermaid.js requirements (like avoiding `"`) MUST be explicitly represented in the system rules as LLMs frequently write malformed diagram strings.
- **Low Temperature:** Maintain `temperature=0.1` or `0.0` at all times to prevent creative drift and enforce the JSON structure.

## File/Module References
- **Implementation:** `backend/main.py` (Lines 21-109) - Houses the `DesignPayload`, `SYSTEM_PROMPT`, and the `/api/compile` endpoint logic.
