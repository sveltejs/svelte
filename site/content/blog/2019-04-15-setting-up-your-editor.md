---
title: Setting up your editor
description: Instructions for configuring linting and syntax highlighting
author: Rich Harris
authorURL: https://twitter.com/Rich_Harris
draft: true
---

_**Coming soon**_

This post will walk you through setting up your editor so that it recognises Svelte files:

- eslint-plugin-svelte3
- svelte-vscode
- associating .svelte files with HTML in VSCode, Sublime, etc.

## Atom

To treat `*.svelte` files as HTML, open _**Edit → Config...**_ and add the following lines to your `core` section:

```cson
"*":
  core:
    …
    customFileTypes:
	    "text.html.basic": [
        "svelte"
      ]
```

## Vim/Neovim

You can use the [coc-svelte extension](https://github.com/coc-extensions/coc-svelte) which utilises the official language-server.

As an alternative you can treat all `*.svelte` files as HTML. Add the following line to your `init.vim`:

```
au! BufNewFile,BufRead *.svelte set ft=html
```

To temporarily turn on HTML syntax highlighting for the current buffer, use:

```
:set ft=html
```

To set the filetype for a single file, use a [modeline](https://vim.fandom.com/wiki/Modeline_magic):

```
<!-- vim: set ft=html :-->
```

## Visual Studio Code

We recommend using the official [Svelte for VS Code extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

## JetBrains WebStorm

The [Svelte Framework Integration](https://plugins.jetbrains.com/plugin/12375-svelte/) can be used to add support for Svelte to WebStorm, or other Jetbrains IDEs. Consult the [WebStorm plugin installation guide](https://www.jetbrains.com/help/webstorm/managing-plugins.html) on the JetBrains website for more details.

## Sublime Text 3

Open any `.svelte` file.

Go to _**View → Syntax → Open all with current extension as... → HTML**_.
