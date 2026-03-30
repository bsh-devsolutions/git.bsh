# Commands

The CLI binary is **`git`** (npm package **`@bshsolutions/git`**). Examples use **`npx`** so you can copy-paste without a global install.

```text
Commands
├── Built-in help
├── Global usage
├── hello
│   ├── Usage
│   ├── Options
│   └── Examples
└── commit
    └── (see commit.md for the subcommand tree)
```

```text
@bshsolutions/git (conceptual)
├── [command] [options]     (root)
├── hello [--name]
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

## hello

Print a greeting—handy for smoke-testing that Node, `npx`, and the package resolve correctly.

### Usage

```text
npx @bshsolutions/git hello [options]
```

### Options

| Option | Description |
| --- | --- |
| `-n, --name <name>` | Who to greet (default: `World`) |

### Examples

```sh
npx @bshsolutions/git hello
npx @bshsolutions/git hello --name Alice
```

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
