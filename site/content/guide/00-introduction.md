---
title: Introduction
---

### What is Svelte?

Svelte is a tool for building fast web applications.

It is similar to JavaScript frameworks such as React and Vue, which share a goal of making it easy to build slick interactive user interfaces.

But there's a crucial difference: Svelte converts your app into ideal JavaScript at *build time*, rather than interpreting your application code at *run time*. This means you don't pay the performance cost of the framework's abstractions, and you don't incur a penalty when your app first loads.

You can build your entire app with Svelte, or you can add it incrementally to an existing codebase. You can also ship components as standalone packages that work anywhere, without the overhead of a dependency on a conventional framework.

[Read the introductory blog post](/blog/frameworks-without-the-framework) to learn more about Svelte's goals and philosophy.


### Understanding components

In Svelte, an application is composed from one or more *components*. A component is a reusable self-contained block of code that encapsulates markup, styles and behaviours that belong together, written into an `.html` file. Here's a simple example:

```html
<!--{ title: 'Hello world!' }-->
<h1>Hello {name}!</h1>
```

```json
/* { hidden: true } */
{
	name: 'world'
}
```

> Wherever you see <strong style="font-weight: 700; font-size: 16px; font-family: Inconsolata, monospace; color: rgba(170,30,30, 0.8)">REPL</strong> links, click through for an interactive example

Svelte turns this into a JavaScript module that you can import into your app:

```js
/* { filename: 'main.js' } */
import App from './App.html';

const app = new App({
  target: document.querySelector('main'),
  props: { name: 'world' },
});

// change the component's "name" prop. We'll learn about props (aka properties) below
app.name = 'everybody';

// detach the component and clean everything up
app.$destroy();
```

Congratulations, you've just learned about half of Svelte's API!


### Getting started

Normally, this is the part where the instructions might tell you to add the framework to your page as a `<script>` tag. But because Svelte runs at build time, it works a little bit differently.

The best way to use Svelte is to integrate it into your build system – there are plugins for Rollup, Webpack and others, with more on the way. See [here](https://github.com/sveltejs/svelte/#svelte) for an up-to-date list.

> You will need to have [Node.js](https://nodejs.org/en/) installed, and have some familiarity with the command line

#### Getting started using the REPL

Going to the [REPL](/repl) and pressing the *download* button on any of the examples will give you a .zip file containing everything you need to run that example locally. Just unzip it, `cd` to the directory, and run `npm install` and `npm run dev`. See [this blog post](/blog/the-easiest-way-to-get-started) for more information.

#### Getting started using degit

[degit](https://github.com/Rich-Harris/degit) is a tool for creating projects from templates stored in git repos. Install it globally...

```bash
npm install -g degit
```

...then you can use it to spin up a new project:

```bash
degit sveltejs/template my-new-project
cd my-new-project
npm install
npm run dev
```

You can use any git repo you like — these are the 'official' templates:

* [sveltejs/template](https://github.com/sveltejs/template) — this is what you get by downloading from the REPL
* [sveltejs/template-webpack](https://github.com/sveltejs/template-webpack) — similar, but uses [webpack](https://webpack.js.org/) instead of [Rollup](https://rollupjs.org/guide/en)

#### Getting started using the CLI

Svelte also provides a Command Line Interface, but it's not recommended for production use. The CLI will compile your components to standalone JavaScript files, but won't automatically recompile them when they change, and won't deduplicate code shared between your components. Use one of the above methods instead.

If you've installed `svelte` globally, you can use `svelte --help` for a complete list of options. Some examples of the more common operations are:

```bash
# Generate a JavaScript module from MyComponent.html
svelte compile MyComponent.html > MyComponent.js
svelte compile -i MyComponent.html -o MyComponent.js

# Generate a UMD module from MyComponent.html, inferring its name from the filename ('MyComponent')
svelte compile -f umd MyComponent.html > MyComponent.js

# Generate a UMD module, specifying the name
svelte compile -f umd -n CustomName MyComponent.html > MyComponent.js

# Compile all .html files in a directory
svelte compile -i src/components -o build/components
```

> You can also use [npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) to use the CLI without installing Svelte globally — just prefix your command with `npx`: `npx svelte compile ...`
