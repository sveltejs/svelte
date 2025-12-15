---
title: Getting started
---

We recommend using [SvelteKit](../kit), which lets you [build almost anything](../kit/project-types). It's the official application framework from the Svelte team and powered by [Vite](https://vite.dev/).

Create a new project with your preferred package manager:

**npm:**

```sh
npx sv create myapp
cd myapp
npm install
npm run dev
```

**yarn:**

```sh
yarn dlx sv create myapp
cd myapp
yarn install
yarn dev
```

**pnpm:**

```sh
pnpm dlx sv create myapp
cd myapp
pnpm install
pnpm dev
```

**bun:**

```sh
bunx sv create myapp
cd myapp
bun install
bun dev
```

See the [CLI docs](../cli) for more information about the `sv` command line tool.

Don't worry if you don't know Svelte yet! You can ignore all the nice features SvelteKit brings on top for now and dive into it later.

## Alternatives to SvelteKit

You can also use Svelte directly with Vite by running `npm create vite@latest` and selecting the `svelte` option. With this, `npm run build` will generate HTML, JS, and CSS files inside the `dist` directory using [vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte). In most cases, you will probably need to [choose a routing library](/packages#routing) as well.

>[!NOTE] Vite is often used in standalone mode to build [single page apps (SPAs)](../kit/glossary#SPA), which you can also [build with SvelteKit](../kit/single-page-apps).

There are also [plugins for other bundlers](/packages#bundler-plugins), but we recommend Vite.

## Installing Svelte in an existing project

If you have an existing project for example via [Inertia](https://inertiajs.com/) and want to add Svelte to it, you can install Svelte and [vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte) manually.

First, install Svelte and the Vite plugin:

**npm:**

```sh
npm install --save-dev --save-exact svelte @sveltejs/vite-plugin-svelte
```

**yarn:**

```sh
yarn add --dev --exact svelte @sveltejs/vite-plugin-svelte
```

**pnpm:**

```sh
pnpm add --save-dev --save-exact svelte @sveltejs/vite-plugin-svelte
```

**bun:**

```sh
bun add --dev --exact svelte @sveltejs/vite-plugin-svelte
```

Then, add the Svelte plugin to your `vite.config.js`:

```js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      /* plugin options */
    })
  ]
});
```

## Editor tooling

The Svelte team maintains a [VS Code extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode), and there are integrations with various other [editors](https://sveltesociety.dev/collection/editor-support-c85c080efc292a34) and tools as well.

You can also check your code from the command line using [`sv check`](https://github.com/sveltejs/cli) to check for Unused CSS
Svelte A11y hints, JavaScript/TypeScript compiler errors.

Alternatively, you can install `svelte-check` (powers `sv check`) directly:

**npm:**

```sh
npm install --save-dev --save-exact svelte-check
```

**yarn:**

```sh
yarn add --dev --exact svelte-check
```

**pnpm:**

```sh
pnpm add --save-dev --save-exact svelte-check
```

**bun:**

```sh
bun add --dev --exact svelte-check
```

## Getting help

Don't be shy about asking for help in the [Discord chatroom](/chat)! You can also find answers on [Stack Overflow](https://stackoverflow.com/questions/tagged/svelte).
