# Commands

Run the CLI with **`npx @bshsolutions/git`**. All examples use that form.

## Global usage

```text
npx @bshsolutions/git [command] [options]
```

Help for any level:

```sh
npx @bshsolutions/git --help
npx @bshsolutions/git commit --help
npx @bshsolutions/git commit msg validate --help
```

## Commands

See the generated tree: [commands tree](./cmds-tree.md).

### init

Creates the project config at **`.github/bsh.json`** if it does not exist yet (merge-safe; does not overwrite an existing file). Run once per repo when you want the CLI to own local settings.

```sh
npx @bshsolutions/git init
```

### rm

Removes **`.github/bsh.json`**. If the parent directory is empty afterward, it is removed too. No error if the file is already missing.

```sh
npx @bshsolutions/git rm
```

### commit

**Alias:** `c` — e.g. `npx @bshsolutions/git c msg validate`.

Parent command for structured commit tooling. Leaf commands live under **`commit msg`** (see below).

### commit msg

Configures and enforces commit messages using **`commit.message`** in `.github/bsh.json` (format with `{type}`, `{scope}`, `{message}` placeholders, plus allowed types and scopes). Subcommands:

| Subcommand   | Alias | Role |
| ------------ | ----- | ---- |
| `install`    | `i`   | Add a Git `commit-msg` hook that runs validation |
| `uninstall`  | `ui`  | Remove that hook |
| `validate`   | `v`   | Check a message string or file |
| `prompt`     | `p`   | Interactive type / scope / message, then `git commit` |

```sh
npx @bshsolutions/git commit msg --help
```

#### commit msg install

- **`-f` / `--force`** — Replace an existing `commit-msg` hook. Without `--force`, the command fails if a hook file already exists and was not installed by this tool.

In an interactive terminal, you are prompted for format, types, and scopes; answers are merged into `.github/bsh.json`. A shell hook is written under **`.git/hooks/commit-msg`** that runs:

`npx @bshsolutions/git commit msg validate "$1"`

Requires a Git repo with a resolvable hooks directory.

```sh
npx @bshsolutions/git commit msg install
npx @bshsolutions/git commit msg install --force
```

#### commit msg uninstall

- **`-f` / `--force`** — Delete the hook even if it does not contain this tool’s install marker. Without `--force`, uninstall only succeeds for hooks installed by **`commit msg install`**.

```sh
npx @bshsolutions/git commit msg uninstall
npx @bshsolutions/git commit msg uninstall --force
```

#### commit msg validate

**Argument (optional):** `[message-or-file]` — If omitted, validation uses an empty input (and fails). If the value is an existing file path, the file contents are read; otherwise the argument is treated as the raw message.

Validates the **first non-empty, non-`#` comment line** of the message as the header against your configured format, types, and scopes. Exits non-zero on failure (suitable for hooks and CI).

```sh
npx @bshsolutions/git commit msg validate "feat (app): add login"
npx @bshsolutions/git commit msg validate /path/to/COMMIT_EDITMSG
```

#### commit msg prompt

Interactive flow: prompts for each placeholder in your configured format (select or type from allowed lists), shows a preview, then optionally runs **`git commit -m "<header>"`**. Requires a TTY.

- **`--dry-run`** — Print the composed header only; do not run `git commit`.
- **`--skip-verify`** — Pass **`--no-verify`** to `git commit` (skip Git hooks).

```sh
npx @bshsolutions/git commit msg prompt
npx @bshsolutions/git commit msg prompt --dry-run
npx @bshsolutions/git commit msg prompt --skip-verify
```

---

* [← Documentation home](README.md) · [Setup →](setup.md)*
