# Query Optic (QueryOptimizer)

## 📌 Project Overview
**Query Optic** is an intelligent, visual SQL analyzer and data flow simulator. The primary objective of the tool is to provide developers, database administrators, and data architects with a deep, visual understanding of how their SQL queries are transformed and executed step-by-step. 

By leveraging AI (Google Gemini), Query Optic takes raw SQL queries and optional database schemas, and translates them into High-Level Logical Data Flow Diagrams—mimicking the structural logic found in professional database tools like Oracle SQL Developer.

## 🚀 Key Features
- **Intelligent SQL Parsing:** Uses Google Gemini (`gemini-3.5-flash`) to parse incoming SQL strings and schemas to detect underlying execution steps.
- **Visual Data Flow (Mermaid.js):** Generates interactive `Mermaid.js` flowcharts (TD) mapping the chronological order of data mutations (e.g., Base Tables ➔ Joins ➔ Filters ➔ Aggregates ➔ Windows).
- **Node-Level Analysis:** Each node in the visual chart represents an operation (`TABLE_SCAN`, `JOIN`, `GROUP_BY`, `WINDOW`). Users can click or inspect nodes to see metadata including:
  - **Operation Type:** (e.g., Hash Join, Nested Loop)
  - **Complexity / Impact:** (High, Medium, Low)
  - **Explanation:** Plain English explanation of the logical step.
  - **Optimization Tips:** Actionable insights for query tuning.
- **Color-Coded Semantics:** Distinct colors identify heavy operations (aggregations), standard WHERE filters, and post-aggregation HAVING filters.

## 🏗️ Technical Architecture
The project is split into a modern decoupled architecture:

### Frontend (Next.js)
- **Framework:** Next.js (React) using the App Router.
- **Styling:** Tailwind CSS for a modern, responsive, and aesthetically pleasing UI.
- **Visualization:** Mermaid.js integration for rendering flowchart outputs dynamically based on backend JSON payloads.

### Backend (FastAPI / Python)
- **Framework:** FastAPI for high-performance API endpoints.
- **AI Integration:** Utilizes the `google-genai` SDK to interface with Gemini.
- **Core Endpoint (`/api/compile`):** Receives the `sql` and `schema` payload, generates a structured prompt enforcing strict formatting constraints, and returns a sanitized JSON object containing the `mermaid_graph` and `nodes_metadata`.
- **Environment Management:** Uses `.env` for managing API credentials securely.

## 🎯 Primary Objective for Maintenance & Re-creation
- **Stability and Performance:** Ensure strict adherence to project-level rate limits to avoid API quota exhaustion.
- **AI Consistency:** Ensure the AI engine consistently generates strictly formatted JSON that maps directly to Mermaid syntax without trailing commas or syntax-breaking quotation marks.
- **Functional Cleanliness:** Maintain a clean interface, stripping out broken experimental features in favor of core stability and accuracy.

## 📝 Setup & Local Execution
1. **Backend:** Navigate to `backend/`, activate your `venv`, install requirements, ensure `GEMINI_API_KEY` is in `.env`, and start the FastAPI server.
2. **Frontend:** Navigate to `frontend/`, run `npm install`, and start the Next.js standard dev environment with `npm run dev`. Navigate to `http://localhost:3000`.
