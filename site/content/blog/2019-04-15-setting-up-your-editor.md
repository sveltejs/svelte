---
title: Setting up your editor
description: Instructions for configuring linting and syntax highlighting
author: Rich Harris
authorURL: https://twitter.com/Rich_Harris
draft: true
---

*__Coming soon__*

This post will walk you through setting up your editor so that recognises Svelte files:

* eslint-plugin-svelte3
* svelte-vscode
* associating .svelte files with HTML in VSCode, Sublime, etc.

## Atom

To treat `*.svelte` files as HTML, open *__Edit → Config...__* and add the following lines to your `core` section:

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

To treat all `*.svelte` files as HTML, add the following line to your `init.vim`:

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

To treat `*.svelte` files as HTML, add the following lines to your `settings.json` file:

```cson
  "files.associations": {
    "*.svelte": "html"
  }
```

## JetBrains WebStorm

To treat `*.svelte` files as HTML in WebStorm, you need to create a new file type association. Please refer to the [JetBrains website](https://www.jetbrains.com/help/webstorm/creating-and-registering-file-types.html) to see how.

## Sublime Text 3

Open any `.svelte` file.

Go to *__View → Syntax → Open all with current extension as... → HTML__*.
