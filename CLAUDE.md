# QA Standards

## Package Management
- Use **Yarn** for all package management. Do not use npm or pnpm.

## Node Compatibility
- All code must be compatible with **Node 23**.

## Testability
- Every interactive element — buttons, inputs, and links — must have a `data-testid` attribute.
- Example: `<button data-testid="submit-btn">Submit</button>`

## Loading States
- Components must display a `Loading...` state while API calls are in progress.
- Example: `if (isLoading) return <div data-testid="loading">Loading...</div>`
