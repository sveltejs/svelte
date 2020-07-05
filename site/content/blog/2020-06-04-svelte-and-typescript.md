---
title: Svelte <3 TypeScript
description: Typernetically enhanced web apps
author: Orta Therox
authorURL: https://twitter.com/orta
---

It's been on the TODO list for a while, and it's now happening. TypeScript with Svelte is now a first class citizen of the eco-system.

We think it'll help you handle much larger Svelte code bases regardless of whether you use TypeScript.

## What does it mean to support TypeScript in Svelte?

TypeScript support in Svelte has been possible for a long time, but you had to mix a lot of disparate tools together and each project ran independently. Today, nearly all of these tools live under the Svelte organization and are maintained by a set of people who take responsibility over the whole pipeline and have common goals.

A week before COVID was declared a pandemic, [I pitched a consolidation](https://github.com/sveltejs/svelte/issues/4518) of the best Svelte tools and ideas from similar dev-ecosystems and provided a set of steps to get TypeScript support first class. Since then, many people have pitched in and wrote the code to get us there.

#### How does it work?

To understand the two main parts of TypeScript support, we'll compare it to the technique TypeScript uses to provide dev tools. There is a compiler `tsc` which you run on the command-line to convert `*.ts` to `*.js`, then there is a `TSServer` which is a node API that responds to requests from text editors. The `TSServer` is what provides all the JavaScript and TypeScript experience, and it has most of the compiler's code inside it.

For Svelte, we have the Svelte compiler, and now we have the [`svelte-language-server`](https://github.com/sveltejs/language-tools/tree/master/packages/language-server#svelte-language-server) which responds to text editor calls via the [Language Server Protocol standard](https://microsoft.github.io//language-server-protocol/overviews/lsp/overview/). First class TypeScript support means that _both_ of these two systems do good job of handling TypeScript code.

The Svelte compiler support for TypeScript is handled by [Christian Kaisermann](https://github.com/kaisermann)'s [`svelte-preprocess`](https://github.com/sveltejs/svelte-preprocess#svelte-preprocess) which is now an official Svelte project.

For the editor level, we took inspiration from [Pine's](https://github.com/octref) work in the [Vue](https://vuejs.org) ecosystem via [Vetur](https://github.com/vuejs/vetur). Vetur provides an [LSP](https://github.com/vuejs/vetur/blob/master/server), a VS Code extension and a [CLI](https://github.com/vuejs/vetur/blob/master/vti). Svelte now also has an [LSP](https://github.com/sveltejs/language-tools/blob/master/packages/language-server), a [VS Code extension](https://github.com/sveltejs/language-tools/blob/master/packages/svelte-vscode) and a [CLI](https://github.com/sveltejs/language-tools/blob/master/packages/svelte-check).


#### `*.svelte` Introspection

For the official Svelte VS Code extension, we built off the foundations which [James Birtles](https://github.com/UnwrittenFun) has created in [`UnwrittenFun/svelte-vscode`](https://github.com/UnwrittenFun/svelte-vscode) and [`UnwrittenFun/svelte-language-server`](https://github.com/UnwrittenFun/svelte-language-server/).

[Simon H](https://github.com/dummdidumm) and [Lyu, Wei-Da](https://github.com/jasonlyu123) have done great work improving the Javascript and Typescript introspection, including integrating [@halfnelson](https://github.com/halfnelson)'s [svelte2ts](https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx#svelte2tsx) which powers understanding the props on components in your codebase.

### Try today

The Svelte template has been extended with a script to convert it to a TypeScript project.

```bash
npx degit svelte/template
node scripts/updateTypeScriptVersion.js
```

### Adding TypeScript support to your project

##### 1. Compiling TypeScript

You first need to set up [`svelte-preprocess`](https://github.com/sveltejs/svelte-preprocess#svelte-preprocess) and  [`@rollup/plugin-typescript`](https://github.com/rollup/plugins/tree/master/packages/typescript#rollupplugin-typescript) for the compiler:

When in a rollup project, this would mean:

```diff
+ import preprocess from 'svelte-preprocess'
+ import typescript from '@rollup/plugin-typescript';

export default {
  ...,
  plugins: [
    svelte({
+       preprocess: autoPreprocess({ /* options */ })
    }).
+   typescript({ sourceMap: !production }),
  ]
}
```

[Full instructions for other environments here](https://github.com/sveltejs/svelte-preprocess#usage)

To configure TypeScript, you will need to create a `tsconfig.json` in the root of your project:

```json
{
  "extends": "@tsconfig/svelte/tsconfig.json",

  "include": ["src/**/*"],
  "exclude": ["node_modules/*", "__sapper__/*", "public/*"],
}
```

Your `include`/`exclude` may differ per project.

##### 2. Editor Support

Any editor which supports using an LSP can work, the [VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) extension has been our primary focus but there is work in progress [on Atom](https://github.com/sveltejs/language-tools/pull/160), and [coc-svelte](https://github.com/coc-extensions/coc-svelte) has been updated with the latest changes.

These editor extensions will improve your coding experience even if you only use JavaScript. The editor won't offer errors, but it will offer inference and refactoring tools. You can [add `// @check-js`](https://www.staging-typescript.org/docs/handbook/intro-to-js-ts.html) to the top of a `<script>` tag using JavaScript to get better error messages.

To switch a `<script>` to use TypeScript, use `<script lang="ts">` and that should be it. Hopefully you won't be seeing an ocean of red squiggles.

##### 3. CI Checks

Having red squiggles is great, well, kinda. On the long run though, you want to be able to verify that there are no errors in your code. To verify your project is error free, you can use the CLI tool [`svelte-check`](https://www.npmjs.com/package/svelte-check). It acts like an editor asking for errors against all of your `.svelte` files.

You can add the dependency to your project and then add it to CI.

```bash
❯ yarn svelte-check

Loading svelte-check in workspace: /Users/ortatherox/dev/svelte/example-app
Getting Svelte diagnostics...
====================================

/Users/ortatherox/dev/svelte/example-app/src/App.svelte:3:2
Error: Type '123' is not assignable to type 'string'. (ts)

====================================
svelte-check found 1 error
error Command failed with exit code 1.
```
