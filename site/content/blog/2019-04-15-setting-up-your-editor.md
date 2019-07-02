---
title: Setting up your editor
description: Instructions for configuring linting and syntax highlighting
author: Rich Harris
authorURL: https://twitter.com/Rich_Harris
draft: true
---

*Coming soon* This post will walk you through setting up your editor so that recognises Svelte files:

* eslint-plugin-svelte3
* svelte-vscode
* associating .svelte files with HTML in VSCode, Sublime, Atom, etc etc etc

## Vim/Neovim

To treat all `*.svelte` files as HTML, add the following line to your `init.vim`:

    au! BufNewFile,BufRead *.svelte set ft=html

To temporarily turn on HTML syntax highlighting for the current buffer, use:

    :set ft=html

To set the filetype for a single file, use a [modeline](https://vim.fandom.com/wiki/Modeline_magic):

    <!-- vim: set ft=html :-->
