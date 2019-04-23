---
title: Svelte for new developers
description: Never used Node.js or the command line? No problem
author: Rich Harris
authorURL: https://twitter.com/Rich_Harris
draft: true
---

*Coming soon* This blog post will walk you through installing Node.js and git and using Terminal.app to clone a project template and start developing with Svelte.  For now, here is a brief FAQ.

- [Can I use Svelte with Babel?](#can-i-use-svelte-with-babel)
- [Can I use Svelte with Typescript?](#can-i-use-svelte-with-typescript)
## Can I use Svelte with Babel?
Yes! You can put `babel-loader` after `svelte-loader` in your webpack config, or `rollup-plugin-babel` after `rollup-plugin-svelte` in your Rollup config, and it should all work. If you've got wacky stuff inside your `<script>` you may need to use the preprocess option for the bundler plugin.
## Can I use Svelte with Typescript?
Svelte for Typescript is coming soon.
