# Setup

## Local link (try the package in another project)

```sh
npm run install
npm run build # or watch

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
