# Smoke Test Workflow

This workflow verifies the application's health using Yarn and Node 23.

## Requirements
- Node 23
- Yarn

## Steps

### 1. Install Dependencies
```bash
yarn install
```

### 2. Build the Application
```bash
yarn build
```

### 3. Run Smoke Tests
```bash
yarn test
```

## Pass Criteria
- `yarn build` exits with code `0` (no build errors)
- `yarn test` exits with code `0` (all tests pass)

## Failure Handling
- If either command fails, the application is considered unhealthy.
- Check the output logs for errors and fix before re-running the workflow.
