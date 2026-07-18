# QueryOptic Agent Guidelines

These rules apply to every agent working in this repository. The goal is a reliable, maintainable, and fully verified application—not merely code that appears to work.

## 1. Working principles

- Understand the existing product, architecture, and relevant code before changing anything. Do not guess at APIs, data formats, or user expectations.
- Keep each execution round focused on one coherent, reviewable outcome. Prefer small, incremental changes over broad rewrites.
- Preserve existing user work. Never discard, reset, overwrite, or reformat unrelated changes.
- Make reasonable, documented assumptions when they are low-risk. Stop and ask for direction before a decision that changes product scope, data, security, cost, or external integrations.
- Treat errors as signals to investigate. Do not hide failures with empty catches, broad type suppressions, disabled tests, or hard-coded success states.
- Keep the application accessible, responsive, secure, and usable with realistic data—not only the happy path.

## 2. Required change log

Maintain a root-level `CHANGELOG_AGENT.md` file. Create it before the first product change if it does not exist.

After every execution round that changes code, configuration, dependencies, documentation, tests, or generated project assets, append an entry before committing:

```md
## YYYY-MM-DD — Short outcome

- Changed: concise list of files/features changed.
- Why: user need or defect addressed.
- Verified: exact commands and their result.
- Known limitations: remaining risks, follow-ups, or `None`.
```

Rules:

- Use factual, concise entries; never include secrets, access tokens, personal data, or raw production data.
- Do not rewrite previous entries except to correct a clear factual error.
- Record failed or blocked verification honestly, including why it could not run.
- Keep the change log committed alongside the change it describes.

## 3. Implementation standards

- Follow the repository’s established language, framework, formatter, lint rules, and naming conventions.
- Add or update tests with every behavior change. Cover normal use, invalid input, boundary cases, loading states, empty states, and error states when relevant.
- Validate all external input on the server or trusted boundary. Use parameterized queries and never expose credentials, tokens, or internal error details to clients.
- Keep secrets in environment variables and provide safe example configuration only. Ensure `.env` and other secret-bearing files are ignored by Git.
- Make database and schema changes backward-aware, reversible where practical, and accompanied by migrations plus migration tests when the stack supports them.
- Avoid unnecessary dependencies. Pin or lock dependencies according to the project’s package-manager convention and run dependency/security checks where available.
- Prefer clear, typed, composable code. Comment only decisions that cannot be understood from the code itself.
- Design UI changes for keyboard navigation, focus visibility, semantic HTML, sufficient contrast, clear form errors, and small screens.
- Instrument meaningful failures and key user flows without logging sensitive information.

## 4. Verification gate

No execution round is complete until the relevant verification passes. Run checks from most targeted to broadest and fix failures caused by the round.

At a minimum, when available in the project, run:

1. Formatting check.
2. Static analysis / type checking.
3. Unit tests.
4. Integration and API tests.
5. Production build.
6. End-to-end browser tests with Playwright.

Run the complete verification suite at least twice before declaring a feature, release candidate, or substantial refactor complete: once after implementation and again after final fixes/cleanup. Record both runs in `CHANGELOG_AGENT.md`.

Use the project’s existing test commands. If a command is absent, add the smallest appropriate test setup instead of silently skipping that category. If the environment genuinely prevents a test (for example, unavailable credentials or an external service), document the exact limitation and run the strongest safe alternative.

## 5. Playwright end-to-end testing

Use Playwright for browser-facing behavior. Keep tests deterministic and independent.

- Test the app through user-visible behavior and accessible roles/labels; avoid brittle selectors tied to styling or DOM structure.
- Cover each critical journey: application load, primary task completion, validation/error feedback, navigation, authentication/authorization where applicable, and persistence or reload behavior.
- Run tests in Chromium at minimum. Run configured cross-browser projects before releases.
- Test at a desktop viewport and at least one mobile viewport for changed screens.
- Use isolated test data, test accounts, and mocked/stubbed external services where needed. Never run destructive tests against production.
- Capture traces, screenshots, and video on failure when supported; inspect failures rather than retrying blindly.
- Ensure the development server is started and stopped by the test configuration or documented test command.

Suggested commands (adapt to the repository’s package manager and scripts):

```sh
npm run test
npm run build
npx playwright test
npx playwright test --project=chromium
```

## 6. Git and GitHub workflow

At the end of every successful execution round:

1. Review `git status` and `git diff`; include only files relevant to the round.
2. Update `CHANGELOG_AGENT.md`.
3. Run the required verification gate.
4. Create one focused commit with an imperative, descriptive message.
5. Push the current branch to GitHub after the commit succeeds, when remote access and authorization are available.

Commit messages should follow this pattern:

```text
type(scope): concise imperative summary
```

Examples:

```text
feat(search): add query result filters
fix(auth): reject expired reset tokens
test(editor): cover draft recovery in Playwright
docs(agent): add development workflow guidelines
```

Rules:

- Do not bundle unrelated work into the same commit.
- Never commit secrets, local environment files, build output, test artifacts, or private user data.
- Do not force-push, rewrite shared history, or use destructive Git commands unless the user explicitly authorizes it.
- If a commit or push cannot be completed, report the exact reason and leave the working tree intact; do not claim it was committed.
- Do not commit changes when required checks are failing, except when the user explicitly asks for a clearly marked work-in-progress commit.

## 7. Completion checklist

Before handing a round back to the user, confirm:

- The requested behavior is implemented and manually sanity-checked where meaningful.
- Relevant automated tests, build, and Playwright journeys have passed twice for substantial work.
- Test coverage was added or updated for changed behavior.
- No console errors, unhandled promise rejections, broken links, or obvious accessibility regressions remain.
- `CHANGELOG_AGENT.md` accurately records the work and verification.
- The Git diff contains only intended changes.
- A focused commit was created and pushed when authorized.
- The handoff states what changed, what was verified, and any real limitation or follow-up.

## 8. When blocked

- Investigate with safe, read-only checks first.
- State the blocker, evidence, and the smallest decision or access needed from the user.
- Do not invent credentials, bypass security controls, weaken tests, or claim verification that did not occur.
- Resume the verification and commit workflow as soon as the blocker is resolved.
