# Agent Development Guidelines

This document outlines the strict guidelines and standard operating procedures that the AI Agent must follow during the development and maintenance of the application. Adhering to these rules ensures stability, high code quality, and a perfectly working end product.

## 1. Change Tracking and Logging
- **Maintain a Log File**: Continuously update a central log file (e.g., `changelog.md` or `agent_activity_log.txt`) in the project root.
- **Detailed Entries**: Document every file created, modified, or deleted within this log. Briefly include the rationale behind significant architectural or logical changes.
- **Constant Syncing**: Log entries must be made during the execution process to maintain an accurate history of the agent's actions.

## 2. Version Control (GitHub)
- **Frequent & Atomic Commits**: Commit the changes to GitHub after each round of execution or successful logical task.
- **Descriptive Commit Messages**: Use clear, standard commit message conventions (e.g., `feat: added authentication`, `fix: resolved navigation bug`, `docs: updated readme`). 
- **No Broken Commits**: Ensure the application builds and runs successfully before pushing changes to the main branch. If working on a complex feature, commit to a separate development/feature branch.

## 3. Testing and Validation
- **Iterative Testing**: Test the complete codebase multiple times throughout the development cycle to ensure new additions do not cause regressions or break existing functionality.
- **End-to-End (E2E) Verification**: Setup and utilize **Playwright** (or a similar E2E testing framework) to simulate actual user interactions. Verify that the UI, routing, and underlying logic work seamlessly together in an actual browser environment.
- **Unit & Integration Tests**: Run unit and integration tests for core backend functions, utility functions, and API endpoints. 
- **Self-Correction via Tests**: Never conclude a task if tests are failing. Analyze terminal output, fix the root cause, and re-run all tests until they pass.

## 4. Code Quality & Architecture
- **Modularity**: Write clean, modular, and DRY (Don't Repeat Yourself) code. Break down large components or monolithic files into smaller, reusable pieces.
- **Robust Error Handling**: Implement comprehensive error handling throughout the application. Avoid swallowing errors; ensure they are properly logged and that users see friendly fallback states or error messages instead of blank screens.
- **Static Analysis**: Run linters (e.g., ESLint, Prettier) before finalizing code to enforce consistent styling and catch potential bugs early.
- **Security Best Practices**: Never hardcode sensitive information (API keys, passwords, database URIs). Always rely on environment variables (`.env`).

## 5. UI/UX and Frontend Polish
- **Responsive Design**: Ensure the interface is fully responsive across mobile, tablet, and desktop form factors.
- **Modern Aesthetics**: Implement high-quality visuals. Utilize smooth micro-animations, consistent typography, robust color palettes, and interactive feedback states (hover/active pseudo-classes) to make the app feel dynamic and premium.
- **Accessibility**: Use semantic HTML elements. Implement basic accessibility attributes (e.g., `alt` tags on images, proper `aria` labels) to ensure the application is usable by everyone.

## 6. Execution Protocol
- **Plan Before Acting**: Formulate an implementation plan in thought before altering core functionality. 
- **Verify Dependencies**: Confirm that all necessary packages or external dependencies are installed and properly imported before running scripts.
- **Clear Communication**: If blocked by ambiguous requirements or lacking requisite credentials, pause execution and ask the user for clarification rather than assuming a potentially destructive path.
