# Commit command

The **`commit`** command standardizes commit messages and can install a Git **`commit-msg`** hook so messages are checked before Git finalizes a commit.

**Intended message shape:** `<type> (scope): message` (see **`npx @bshsolutions/git commit --help`** for the full rules this CLI enforces).

```text
Commit
├── install
│   ├── Usage
│   ├── Options
│   └── How the hook invokes the CLI
├── uninstall
│   ├── Usage
│   └── Options
├── validate
│   └── Usage
└── Hook filename
```

```text
commit (CLI)
├── install [--force]
├── uninstall [--force]
└── validate   (alias: v)
```

---

## Subcommands

### install

Writes a **`commit-msg.bsh`** hook under the current repository’s `.git/hooks` (or the path from `git rev-parse --git-path hooks`). The hook runs **`npx @bshsolutions/git commit validate`** with the message file Git provides—unless the hook was installed with **`ENV=local`** (see below).

#### Usage

```text
npx @bshsolutions/git commit install [options]
```

#### Options

| Option | Description |
| --- | --- |
| `-f, --force` | Replace an existing `commit-msg.bsh` hook |

Without **`--force`**, install fails if that hook file already exists.

#### How the hook invokes the CLI

| Condition | What runs |
| --- | --- |
| `ENV=local` | `npm run cli --` (for working against this repository) |
| Default | `npx @bshsolutions/git` |

You must run **`install`** from inside a Git repository.

---

### uninstall

Removes the **`commit-msg.bsh`** hook installed by this tool.

#### Usage

```text
npx @bshsolutions/git commit uninstall [options]
```

#### Options

| Option | Description |
| --- | --- |
| `-f, --force` | Remove the hook even if its contents do not look like a bsh-git hook |

If the hook file is missing, uninstall exits successfully after logging that fact.

---

### validate

Validates a commit message—used by the hook and for manual checks.

#### Usage

```text
npx @bshsolutions/git commit validate
```

**Alias:** `v`.

---

## Hook filename

The hook file name is **`commit-msg.bsh`** (constant in `src/commands/commit/cmds/const.ts` in this repo).

---

* [← Commands](commands.md) · [Documentation home](README.md)*
