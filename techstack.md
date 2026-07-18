# Tech Stack: Query Optic

## 1. Overview
Query Optic is an AI-powered visual SQL data flow analyzer. Designed with a heavily decoupled **Client-Server Architecture**, it uses modern UI technologies (React 19, Next.js 16) connected to a highly performant API Layer (FastAPI, Python) that sequences and integrates specifically with Google's Gemini LLMs. All architectural components are stateless, with configuration relying exclusively on local environment files instead of databases.

## 2. Frontend

The frontend is a strictly typed Single Page Application utilizing the React ecosystem.

- **Framework:** Next.js (Version `16.2.10`) - Used for the core application framework (App Router).
- **Programming Language:** TypeScript (`^5`) / JavaScript - Used for UI architecture, type safety, and logical flows.
- **UI Libraries:**
  - Tailwind CSS (`^4`) - Utility-first CSS for rapid, strictly constrained styling definitions.
  - Lucide React (`^1.25.0`) - Minimalist iconography.
- **Charts & Visualization:** 
  - Mermaid (`^11.16.0`) - Renders the High-Level Logical Data Flow Diagrams (converting TD strings to SVGs natively).
- **Editors:**
  - @monaco-editor/react (`^4.7.0`) - Used for embedded Code editing interfaces (Target SQL / Schema blocks).
- **Animation Libraries:**
  - Framer Motion (`^12.42.2`) - Component fluid animations and mount/unmount logic.
- **Routing:** Next.js native App Router.
- **HTTP Clients:** Native browser `fetch` API.
- **Build Tools:** Native Next.js compiler (Turbopack/Webpack enabled).

## 3. Backend

The backend is built for extreme speed and strict Pythonic typing, providing a slim middleware mapping layer to google-genai.

- **Framework:** FastAPI - Core API Router framework handling `POST` sequences.
- **Runtime & Language:** Python (`3.10+` recommended).
- **API Architecture:** REST architecture.
- **Validation Libraries:** 
  - Pydantic - Strict type enforcement and sanitization for incoming SQL and Schema objects.
- **Environment Management:** 
  - `python-dotenv` - Hydrates server memory with `.env` keys securely.
- **Server Gateway:** Uvicorn - ASGI server implementation for FastAPI execution.

## 4. Database
- **Status:** **N/A**
- The current implementation contains zero underlying database connections or ORMs. Query planning, evaluation, caching constraints, and logic mapping operate statically within application state and LLM session state natively avoiding relational overhead.

## 5. AI & Agent Technologies

Because AI powers the core logical routing:

- **AI SDKs:** `google-genai` (Python SDK)
- **LLM Providers:** Google DeepMind
- **Models:** `gemini-3.5-flash` - Utilized for fast logical reasoning and strict diagram mappings.
- **Prompt Management:** Hardcoded string concatenation driven through `SYSTEM_PROMPT` inside `backend/main.py`.
- **Decision Architecture:** Single-shot generation framework with Temperature constrained implicitly at `0.1` restricting Hallucination potentials.

## 6. DevOps & Infrastructure
*Query Optic is predominantly configured for local execution and is container-ready.*

- **Environment Separation:** Cross-domain CORS configured globally `["*"]` to allow local Node.js boundaries (Port `3000`) and Python frameworks (Port `8000`) seamless connections.

## 7. Development Tools

- **Package Managers:** `npm` (Frontend), `pip` / `venv` (Backend).
- **Linters:** ESLint (`^9` & `eslint-config-next`) tracking UI code health.
- **Formatters:** PostCSS (Tailwind build integrations).
- **Types:** `@types/react` (`^19`), `@types/node` (`^20`).

## 8. External APIs & Services

**Service Name:** Google Gemini APIs
- **Purpose:** Parse SQL mapping, schema definition, rendering output intelligence logic.
- **Authentication Method:** Server-to-Server via Header Bearer authentication pulled from backend `.env` variables (`GEMINI_API_KEY`).
- **Related Modules:** `/api/compile` (FastAPI).

## 9. Project Structure & Dependency Mapping

**Frontend (Client Layer)** ➔ *Next.js ➔ React 19 ➔ Tailwind 4 ➔ Mermaid 11*  
⬇️ *(Native `fetch` API over HTTP)*  
**Backend (API Layer)** ➔ *FastAPI ➔ Pydantic ➔ python-dotenv*  
⬇️ *(google-genai Python SDK)*  
**AI Layer** ➔ *Google Gemini 3.5 Flash Model*

## 10. Version Matrix

| Technology | Version | Purpose | Location |
| ---------- | ------- | ------- | -------- |
| **Next.js** | `16.2.10` | App Routing / CSR / SSR Rendering | `frontend/` |
| **React** | `19.2.4` | Core UI Declarative Framework | `frontend/` |
| **Tailwind CSS** | `^4.0` | Utility CSS mapping engine | `frontend/` |
| **Mermaid** | `^11.16.0` | TD / SVGs visual generator | `frontend/src/components/VisualCanvas.tsx` |
| **Monaco Editor** | `^4.7.0` | SQL native Code editing textareas | `frontend/` |
| **Framer Motion** | `^12.42.2` | Component mount lifecycle animations | `frontend/` |
| **FastAPI** | Current | Backend middleware structural API | `backend/main.py` |
| **Pydantic** | Current | Input class structure validations | `backend/main.py` |
| **Google GenAI** | Current | Gemini API SDK Driver | `backend/main.py` |
| **Python-Dotenv**| Current | Credential isolated sourcing | `backend/main.py` |

## 11. Installation Requirements

- **Software:** Node.js (v20+), Python (3.10+).
- **Environment Variables:** `GEMINI_API_KEY` specifically populated inside `backend/.env`.

## 12. Commands

### Frontend
- **Install:** `npm install`
- **Development:** `npm run dev` *(usually launches on http://localhost:3000)*
- **Linting:** `npm run lint`

### Backend
- **Virtual Environment:** `python -m venv venv` ➔ `source venv/Scripts/activate`
- **Install Dependencies:** `pip install fastapi pydantic google-genai python-dotenv uvicorn`
- **Development Server:** `uvicorn main:app --reload` *(usually launches on http://localhost:8000)*

## 13. Dependency Analysis

- **Core Extensions:** `Next.js` and `FastAPI` define the primary application execution architecture binding the environment.
- **Visualization Blockers:** `Mermaid` (`^11.16.0`) forms the crux of the UI display strategy and handles DOM-level sanitizations natively heavily.
- **Unused Dependencies:** There is no overt bloat in `package.json`, however, the `DataSimulator` referenced structurally in `page.tsx` dependencies is not heavily outlined suggesting future development scaffolding logic.

## 14. Best Practices
- **Version Pinning:** Next.js and React are heavily pinned on strict versions (`16.2.10`, `19.2.4`) securing dependency resolution. It is strongly advised not to bump these outside normal major migration cycles without verifying Mermaid rendering compatibilities on new React fibers.
- **Security Strategy:** API Keys are kept completely behind the FastAPI wall. Do not import `google-genai` inside the frontend directories.
- **Typing Integrity:** Types rely on modern strict constraints minimizing DOM failure during Mermaid load attempts. Maintain `strict` parameters inside `.tsconfig.json`.
