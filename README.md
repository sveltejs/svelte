[![Cybernetically enhanced web apps: Svelte](https://sveltejs.github.io/assets/banner.png)](https://svelte.dev)

[![license](https://img.shields.io/npm/l/svelte.svg)](LICENSE.md) [![Chat](https://img.shields.io/discord/457912077277855764?label=chat&logo=discord)](https://svelte.dev/chat)

## What is Svelte?

Svelte is a new way to build web applications. It's a compiler that takes your declarative components and converts them into efficient JavaScript that surgically updates the DOM.

Learn more at the [Svelte website](https://svelte.dev), or stop by the [Discord chatroom](https://svelte.dev/chat).

## Supporting Svelte

Svelte is an MIT-licensed open source project with its ongoing development made possible entirely by fantastic volunteers. If you'd like to support their efforts, please consider:

- [Becoming a backer on Open Collective](https://opencollective.com/svelte).

Funds donated via Open Collective will be used for compensating expenses related to Svelte's development such as hosting costs. If sufficient donations are received, funds may also be used to support Svelte's development more directly.

## Roadmap

You may view [our roadmap](https://svelte.dev/roadmap) if you'd like to see what we're currently working on.

## Contributing

Please see the [Contributing Guide](CONTRIBUTING.md) and [svelte package](packages/svelte) for contributing to Svelte.

### Development

Pull requests are encouraged and always welcome. [Pick an issue](https://github.com/sveltejs/svelte/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) and help us out!

To install and work on Svelte locally:

```bash
git clone https://github.com/sveltejs/svelte.git
cd svelte
pnpm install
```

> Do not use Yarn to install the dependencies, as the specific package versions in `pnpm-lock.json` are used to build and test Svelte.

To build the compiler and all the other modules included in the package:

```bash
pnpm build
```

To watch for changes and continually rebuild the package (this is useful if you're using [`pnpm link`](https://pnpm.io/cli/link) to test out changes in a project locally):

```bash
pnpm dev
```

The compiler is written in JavaScript and uses [JSDoc](https://jsdoc.app/index.html) comments for type-checking.

### Running Tests

```bash
pnpm test
```

To filter tests, use `-g` (aka `--grep`). For example, to only run tests involving transitions:

```bash
pnpm test -- -g transition
```

### svelte.dev

The source code for https://svelte.dev lives in the [sites](https://github.com/sveltejs/svelte/tree/master/sites/svelte.dev) folder, with all the documentation right [here](https://github.com/sveltejs/svelte/tree/master/documentation). The site is built with [SvelteKit](https://kit.svelte.dev).

## Is svelte.dev down?

Probably not, but it's possible. If you can't seem to access any `.dev` sites, check out [this SuperUser question and answer](https://superuser.com/q/1413402).

## License

[MIT](LICENSE.md)
