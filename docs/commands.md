# Commands

The CLI binary is **`git`** (npm package **`@bshsolutions/git`**). Examples use **`npx`** so you can copy-paste without a global install.

```text
Commands
├── Built-in help
├── Global usage
├── init
└── commit
    └── (see commit.md for the subcommand tree)
```

```text
@bshsolutions/git (conceptual)
├── [command] [options]     (root)
├── init
└── commit
    ├── install [--force]
    ├── uninstall [--force]
    └── validate   (alias: v)
```

---

## Built-in help

```sh
npx @bshsolutions/git --help
```

---

## Global usage

```text
npx @bshsolutions/git [command] [options]
```

---

## init

Creates **`.github/bsh.json`** with the CLI’s default configuration when that file is missing. The directory is created if needed. If the file already exists, the command does nothing (it does not overwrite).

### Usage

```text
npx @bshsolutions/git init
```

The written file uses the same default shape the CLI uses when no config file is present (commit message format and logger settings).

---

## commit

Structured commits and the **`commit-msg`** hook: **`install`**, **`uninstall`**, and **`validate`**. Full behavior, flags, and hook details are in [**Commit**](commit.md).

### Usage

```text
npx @bshsolutions/git commit <subcommand>
```

**Alias:** `c` — for example, `npx @bshsolutions/git c validate`.

> **Note:** Validation rules and the recommended message shape (`<type> (scope): message`) are described in `npx @bshsolutions/git commit --help` and in the [Commit](commit.md) guide.

---

* [← Setup](setup.md) · [Documentation home](README.md) · [Commit →](commit.md)*
