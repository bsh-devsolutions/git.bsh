# BSH Git CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/repository-git.bsh-181717?logo=github)](https://github.com/bsh-devsolutions/git.bsh)

A small **Node.js CLI** for everyday Git workflows: quick **`hello`** checks and a **`commit`** command that can install a **`commit-msg`** hook so messages stay consistent.

| | |
| --- | --- |
| **Binary** | `git` |
| **Package** | [`@bshsolutions/git`](https://www.npmjs.com/package/@bshsolutions/git) |

---

## Features

- **Smoke-test friendly** — `hello` verifies the CLI runs where you need it.
- **Structured commits** — validate messages and optionally enforce them via a Git hook.
- **`npx`-first** — run without a global install, or `npm link` for local development.

---

## Documentation

docs/
- `├──` [**Documentation home**](docs/README.md)
- `├──` [**Setup**](docs/setup.md)
- `├──` [**Commands**](docs/commands.md)
- `└──` [**Commit**](docs/commit.md)

---

## Quick start

```sh
npm install
npm run build
npx @bshsolutions/git hello --name you
```

For local development, linking into other repos, and hook setup, start with [**Setup**](docs/setup.md).
