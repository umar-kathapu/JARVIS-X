# Antigravity Task Execution & Lifecycle Rules

## Strict Single-Prompt Scoping & Execution Boundary
1. **Explicit Prompt Authorization Only**:
   - Execute ONLY the exact command, test, or code change explicitly requested in the user's current prompt.
   - Never autonomously chain follow-up commands, extra verification steps, broad test runs (e.g. `pnpm test`, `turbo run test`), linters, or builds unless the user explicitly requested them in the prompt.

2. **Immediate Idle State Upon Task Completion**:
   - Once the targeted command or file modification finishes, immediately cease tool calls and provide a concise summary response.
   - Do NOT continue executing commands in the same turn. Leave the agent in an IDLE state awaiting the user's next explicit prompt.

3. **No Autonomous Test Chaining or Cascading**:
   - Completing a test (e.g., `acceptance-duplicate.test.ts`) must NEVER automatically trigger another test suite (e.g., `pnpm test`) or monorepo test run.
   - Test results or command outputs must never be interpreted as authorization to initiate additional commands.

4. **No Background Timers, Schedulers, or Watch Loops**:
   - Do not schedule timers (e.g. via `schedule` tool) or start background watchers/polling loops unless explicitly requested by the user.

5. **No Automatic Retries on Failure**:
   - If a test or command fails, do NOT automatically retry or loop. Report the failure details to the user and stop immediately.
