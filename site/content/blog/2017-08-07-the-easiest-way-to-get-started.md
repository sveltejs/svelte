---
title: The easiest way to get started with Svelte
description: This'll only take a minute.
author: Rich Harris
authorURL: https://twitter.com/Rich_Harris
---

Svelte is a [new kind of framework](/blog/frameworks-without-the-framework). Rather than putting a `<script src='svelte.js'>` tag on the page, or bringing it into your app with `import` or `require`, Svelte is a compiler that works behind the scenes to turn your component files into beautifully optimised JavaScript.

Because of that, getting started with it can be a little bit confusing at first. How, you might reasonably ask, do you make a Svelte app?


## 1. Use the REPL

The [Svelte REPL](repl) is the easiest way to begin. You can choose from a list of examples to get you started, and tweak them until they do what you want.

<aside><p>You'll need to have <a href="https://nodejs.org/">Node.js</a> installed, and know how to use the terminal</p></aside>

At some point, your app will outgrow the REPL. Click the **download** button to save a `svelte-app.zip` file to your computer and uncompress it.

Open a terminal window and set the project up...

```bash
cd /path/to/svelte-app
npm install
```

...then start up a development server:

```bash
npm run dev
```

This will serve your app on [localhost:5000](http://localhost:5000) and rebuild it with [Rollup](https://rollupjs.org) every time you make a change to the files in `svelte-app/src`.


## 2. Use degit

When you download from the REPL, you're getting a customised version of the [sveltejs/template](https://github.com/sveltejs/template) repo. You can skip messing around with zip files by using [degit](https://github.com/Rich-Harris/degit), a project scaffolding tool.

In the terminal, install degit globally (you only need to do this once):

```bash
npm install -g degit
```

After that, you can instantly create a new project like so:

```bash
degit sveltejs/template my-new-project
cd my-new-project

npm install
npm run dev
```

Once you've tinkered a bit and understood how everything fits together, you can fork [sveltejs/template](https://github.com/sveltejs/template) and start doing this instead:

```bash
degit your-name/template my-new-project
```

And that's it! Do `npm run build` to create a production-ready version of your app, and check the project template's [README](https://github.com/sveltejs/template/blob/master/README.md) for instructions on how to easily deploy your app to the web with [Now](https://zeit.co/now) or [Surge](http://surge.sh/).

You're not restricted to using Rollup — there are also integrations for [webpack](https://github.com/sveltejs/svelte-loader), [Browserify](https://github.com/tehshrike/sveltify) and others, or you can use the [Svelte CLI](https://github.com/sveltejs/svelte-cli) or the [API](https://github.com/sveltejs/svelte#api) directly. If you make a project template using one of these tools, please share it with the [Svelte Discord chatroom](https://discord.gg/yy75DKs), or via [@sveltejs](https://twitter.com/sveltejs) on Twitter!