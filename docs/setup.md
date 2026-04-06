# Setup

Develop the BSH Git CLI locally, link it into other repositories if needed, and turn on debug logging when something misbehaves. **Invoking the CLI:** this documentation uses only **`npx @bshsolutions/git`** (no global install).

```text
Setup
├── Prerequisites
├── Develop this repo
│   └── Debug logging
├── Local link (try the package in another project)
└── Production-style usage
```

## Prerequisites

- **Node.js** and npm
- **Git** (required for `commit` hook install/uninstall)

## Develop this repo

From the repository root:

```sh
npm install
npm run build
```

Run the CLI with:

```sh
npx @bshsolutions/git --help
```

### Debug logging

```sh
LOG_LEVEL=debug npx @bshsolutions/git commit validate
```

> **Tip:** While hacking on this repo, prefer the package scripts `npm run cli` and `npm run cli:debug` so the local `tsx` entry runs with `ENV=local`.

## Local link (try the package in another project)

```sh
# In this repository
npm link

# In a project where you want the CLI
npm link @bshsolutions/git
```

Remove the link when finished:

```sh
npm unlink @bshsolutions/git
```

## Production-style usage

After publishing or when using `npx`:

```sh
npx @bshsolutions/git --help
```

For installing the commit-msg hook in consumer repositories, see [**Commit**](commit.md). Unless `ENV=local` is set, the hook invokes the CLI via `npx @bshsolutions/git`.
