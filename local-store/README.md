# @microdotbuilder/local-store

Local-first sync primitives for Convex apps.

This package is extracted from the demo in this repo and published to GitHub Packages as `@microdotbuilder/local-store`.

## What you get

- `@microdotbuilder/local-store/react` for client setup, local queries, and optimistic mutations
- `@microdotbuilder/local-store/server` for server-side sync schema helpers

## Publish This Package

1. Rotate the GitHub token before publishing.

The token previously shared in chat should be treated as compromised. Create a fresh classic PAT or fine-grained token with package publish access before the first release.

2. Make sure your token has the right permissions.

For GitHub Packages npm publishing, use a token with:

- `write:packages`
- `read:packages`
- `repo` if GitHub requires repository-linked package updates for your repo settings

3. Load your environment variables.

If your token is stored as `GITHUB_TOKEN` in `.env`, load it into the shell and copy it into `NODE_AUTH_TOKEN` for npm:

```bash
set -a
source .env
set +a
export NODE_AUTH_TOKEN="$GITHUB_TOKEN"
```

4. Build and inspect the tarball.

From the repo root:

```bash
pnpm --filter @microdotbuilder/local-store build
npm_config_cache=/tmp/codex-npm-cache npm pack --dry-run --workspace @microdotbuilder/local-store
```

Or from inside `local-store`:

```bash
pnpm run build
npm_config_cache=/tmp/codex-npm-cache npm pack --dry-run
```

5. Publish the package.

From the repo root:

```bash
npm publish --workspace @microdotbuilder/local-store
```

Or from inside `local-store`:

```bash
npm publish
```

The package is configured to publish to:

```text
https://npm.pkg.github.com
```

6. Verify the release in GitHub.

- Open the repository package page for `@microdotbuilder/local-store`
- Confirm the published version is `0.1.0`
- Confirm the package visibility is public if GitHub did not inherit that automatically
- Confirm this README is shown on the package page

## Use This Package In Another Convex App

1. Configure the GitHub Packages registry.

Create or update your project `.npmrc`:

```ini
@microdotbuilder:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

2. Export your auth token for package install.

```bash
export NODE_AUTH_TOKEN="$GITHUB_TOKEN"
```

3. Install the package and its peer dependencies.

```bash
pnpm add @microdotbuilder/local-store convex react react-dom
```

4. Define your sync schema on the Convex server.

```ts
import {
  streamQueryForServerSchema,
  tableResolverFactory,
} from "@microdotbuilder/local-store/server";
import schema from "../schema";

export const sync = schema;
export const s = tableResolverFactory(sync, schema);
export const streamQuery = streamQueryForServerSchema(schema);
```

5. Create local query and local mutation definitions on the client.

```ts
import { api } from "../../convex/_generated/api";
import { DefinitionFactory } from "@microdotbuilder/local-store/react";
import { sync as syncSchema } from "../../convex/sync/schema";

const factory = new DefinitionFactory(syncSchema);

export const loadAllIssues = factory.defineLocalQuery((ctx) => {
  return ctx.localDb.query("issues").withIndex("by_issue_id").collect();
}, "loadAllIssues");

export const changeTitle = factory.defineLocalMutation(
  api.issues.changeTitle,
  (ctx, args) => {
    const issue = ctx.localDb
      .query("issues")
      .withIndex("by_issue_id", (q) => q.eq("id", args.id as any))
      .unique();

    if (!issue) {
      throw new Error("Issue not found");
    }

    ctx.localDb.replace("issues", args.id, {
      ...issue,
      title: args.title,
    });
  },
);
```

6. Register mutations and create the local store client.

```ts
import { ConvexReactClient } from "convex/react";
import {
  MutationRegistry,
  createLocalStoreClient,
} from "@microdotbuilder/local-store/react";
import { changeTitle } from "./local/mutations";
import { sync as syncSchema } from "../convex/sync/schema";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

const mutationRegistry = new MutationRegistry(syncSchema);
mutationRegistry.register(changeTitle);

export const localStore = createLocalStoreClient({
  syncSchema,
  mutationRegistry,
  convexClient: convex,
  convexUrl: import.meta.env.VITE_CONVEX_URL,
  persistenceKey: "my-app",
});
```

7. Wrap your React app and query through the local store.

```tsx
import { LocalStoreProvider, useLocalQuery } from "@microdotbuilder/local-store/react";
import { localStore } from "./convex";
import { loadAllIssues } from "./local/queries";

function Issues() {
  const issues = useLocalQuery(loadAllIssues, {}) ?? [];
  return <pre>{JSON.stringify(issues, null, 2)}</pre>;
}

export function App() {
  return (
    <LocalStoreProvider localStoreClient={localStore}>
      <Issues />
    </LocalStoreProvider>
  );
}
```

## Notes

- This package is still alpha software.
- The clearest working example is the `curvilinear` app in this repo.
