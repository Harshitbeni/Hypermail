# Agentation Integration Design

## Goal

Add Agentation to the React prototype as a development-only visual feedback
tool. Production builds must not load or render Agentation.

## Architecture

Install the `agentation` package and introduce a small development-only loader
near the React entry point. The entry point renders the mail application as it
does today and mounts Agentation as a sibling only when `import.meta.env.DEV`
is true.

Use a dynamic import through `React.lazy` so production builds can omit the
Agentation module and its import-time side effects. Map Agentation's named
export to the default-export shape required by `React.lazy`. Wrap the lazy
component in `Suspense` with a `null` fallback so loading the feedback tool
never delays or changes the mail interface.

## Components and Data Flow

- `App` remains unchanged and owns the mail prototype.
- A focused `DevAgentation` component owns the development guard, dynamic
  import, and Suspense boundary.
- A small error boundary wraps only the Agentation subtree, keeping package
  loading or rendering failures isolated from the mail application.
- Agentation runs as an independent overlay. It does not receive application
  state and does not alter the mail data flow.

## Error Handling

The development-only loader has no production path. Its loading state renders
nothing. Its error boundary catches package loading or rendering failures,
logs them in development, and renders nothing while leaving the mail
application mounted.

## Validation

Run:

1. `npm run typecheck`.
2. `npm run lint`.
3. `npm run build`.
4. Search the generated `dist` output for `agentation`. No match should remain,
   confirming the production build neither bundles nor requests the package.
