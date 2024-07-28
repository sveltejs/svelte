---
title: "What's new in Svelte: February 2021"
description: Integrations and improvements at lightning speed...
author: Dani Sandoval
authorURL: https://dreamindani.com
---

With the shortest month of the year coming up, Svelte maintainers and community members alike have been busy this last month – from big changes in `svelte-loader`, `prettier-plugin-svelte`, `rollup-plugin-svelte`, and `language-tools` to steady progress in Sapper and `svelte-preprocess`. Meanwhile, lots of folks have been busy integrating Svelte with other popular frameworks.

## New compiler features

- Aria roles from the [WAI-ARIA Graphics Module](https://www.w3.org/TR/graphics-aria-1.0/#role_definitions) are now recognized as valid aria roles in Svelte components (**3.31.1**)
- Compiler warnings for the common React attributes, `className` and `htmlFor`, now make it easier to port React components to Svelte (**3.31.1**)

Have a suggestion for a compiler feature or want to help implement new features/bug fixes? Check out the ["triage: good first issue" tag for Svelte](https://github.com/sveltejs/svelte/issues?q=is%3Aopen+is%3Aissue+label%3A%22triage%3A+good+first+issue%22)

## New bits in language-tools

- User disabled auto import suggestions no longer show in VS Code (**103.0.0**)
- Renaming a variable is now safer with smart additions of a prefix/suffix to renamed variables (**104.0.0**)
- Semantic (token) highlighting for TypeScript users lets theme makers apply semantic styling in their themes, if they support it (**104.0.0**)
- "Extract Component" has been added to the context menu - allowing you to extract components out of files without having to open the command window to type "Svelte: Extract Component" (**104.0.0**)
- The VS Code extension now listens to JavaScript/TypeScript file changes - you no longer need to save the files for the changes to be noticed (**104.1.0**)

For the complete list of changes, check out the language-tools [Releases page](https://github.com/sveltejs/language-tools/releases).

A great way to try the language tools is to download the [Svelte Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode). This extension provides syntax highlighting and rich intellisense for Svelte components in VS Code, using the svelte language server. Check your editor's extension sources to see if there's a Svelte plugin for your IDE or build your own (see [coc-svelte](https://github.com/coc-extensions/coc-svelte) for example)!

## Big improvements across the Svelte ecosystem

- [svelte-loader](https://github.com/sveltejs/svelte-loader) released a major version, 3.0.0 - featuring Webpack 5 and Node 14 support, better hot reloading, and new `compilerOptions` to match `rollup-plugin-svelte`. Breaking changes include dropping Svelte 2 and Node 8 support. [More info in the changelog](https://github.com/sveltejs/svelte-loader/blob/master/CHANGELOG.md)
- [rollup-plugin-svelte](https://github.com/sveltejs/rollup-plugin-svelte) is now at version 7.x - with support for relative filenames, better handling of sourcemaps, and consistent `compilerOptions`. Be sure to [checkout the changelog](https://github.com/sveltejs/rollup-plugin-svelte/blob/master/CHANGELOG.md) for breaking changes when upgrading
- [svelte-preprocess](https://github.com/sveltejs/svelte-preprocess) iterated through some 4.6.x releases this month to improve postcss and scss handling and fix sourcemap transformation for typescript users. [More info in the changelog](https://github.com/sveltejs/svelte-preprocess/blob/main/CHANGELOG.md)
- [Sapper](https://github.com/sveltejs/sapper) got some improvements in scroll tracking and handling encoding query parameters. Dynamic imports also now work as expected in browsers that don't support ES modules. These changes from 0.29.0 and a step-by-step migration guide can be found [in the changelog](https://github.com/sveltejs/sapper/blob/master/CHANGELOG.md)
- [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte) version 2 was released. It received an overhaul and comes with a rewrite of the HTML formatting. The output is now much more in line with how standard Prettier formats HTML. Better defaults for `svelteBracketNewLine` and `options-scripts-markup-styles` should now match how the majority of users like to order the code blocks. Additionally, Prettier's `htmlWhitespaceSensitivity` setting is now supported. [More info in the changelog](https://github.com/sveltejs/prettier-plugin-svelte/blob/master/CHANGELOG.md)

New changes to the Svelte Society website include [a new cheat sheet](https://sveltesociety.dev/cheatsheet) for easy access to useful code patterns and some smaller visual fixes across the site. **Want to help make the Svelte Society website ready for prime time**? [Checkout the GitHub repo](https://github.com/svelte-society/sveltesociety.dev) to get started!

---

## Community Showcase

**Apps & Sites**

- [The official German vaccination dashboard](https://impfdashboard.de/) tracks the current COVID vaccine rollout and features some well-done dataviz.
- [La neuva era de la educatión conectada](https://elfuturoesapasionante.vodafone.es/especiales/educacion-conectada/) is a Vodaphone site that highlights the ways that technology and COVID-19 has changed the education landscape
- [sho.rest](https://github.com/Melonai/shorest) is a self-hostable url shortener
- [night.fm](https://night.fm/) is a cyberpunk-themed radio station

**Demos, Libraries & Components**

- [Svelte Reactive Debugger](https://addons.mozilla.org/en-US/firefox/addon/svelte-reactive-debugger/) is a way to monitor Svelte reactive statements in Firefox devtools
- [svelte-actions](https://github.com/sw-yx/svelte-actions) is a set of prototype Svelte actions for inclusion into official actions in future. [See RFC](https://github.com/sveltejs/rfcs/pull/24) and [Discuss High Level Policy](https://github.com/sw-yx/svelte-actions/issues/7).
- [This css grid gallery](https://svelte.dev/repl/3a1b7fae13b242fe9cd4a4f7aa092fa4?version=3.31.2) made by @joja (in the Svelte Discord) features grid transitions based on a user's mouse position
- [Patchcab](https://github.com/spectrome/patchcab) is a modular Eurorack style synthesizer made with Web Audio.
- [svelte-knob](https://github.com/MelihAltintas/svelte-knob) is a knob control to help with speedometer-style visualization
- [descent-ripple](https://github.com/micha-lmxt/descent-ripple) is a highly customizable javascript ripple animation for buttons
- [makeItSnow](https://github.com/florianlouvet/make-it-snow/blob/main/makeItSnowAction.js) is a Svelte action made by @MrPoule (in the Svelte Discord) that can be used to add ❄️snow❄️ to any component ([Demo](https://svelte.dev/repl/de5223beb45540a5a11c9bd7b318304f?version=3.31.2))
- [svelte-video-player](https://github.com/meigo/svelte-video-player) is a customizable `VideoPlayer` component
- [svelte-readonly](https://github.com/Crisfole/svelte-readonly) is a very small store that exposes only a readable interface.

**New Integrations & Starters**

- [svelte-derver-starter](https://github.com/AlexxNB/svelte-derver-starter) is a starter for baking fullstack application with the client based on Svelte and server side powered by Derver.
- [eleventy-plugin-embed-svelte](https://github.com/shalomscott/eleventy-plugin-embed-svelte) makes it easy to embed Svelte components into an 11ty site.
- [svelte-tailwind-extension-boilerplate](https://github.com/kyrelldixon/svelte-tailwind-extension-boilerplate) is a good foundation for a Chrome extension using either JavaScript or TypeScript, Svelte for the frontend, Tailwind CSS for styling, Jest for testing, and Rollup as the build system.
- [snowpack-ui](https://github.com/rajasegar/snowpack-ui) lets you run & manage Snowpack projects from the browser instead of the terminal
- [Svelte for Appwrite](https://dev.to/torstendittmann/svelte-for-appwrite-4fkg) explains how to integrate with Appwrite, a self-hosted Firebase alternative [GitHub Repo](https://github.com/appwrite/sdk-for-svelte)
- [here-maps-svelte](https://github.com/peopledrivemecrazy/here-maps-svelte) makes it easy to include HERE maps in a Svelte app
- [p5-svelte](https://github.com/tonyketcham/p5-svelte) is an absolutely dead simple way of tossing the creative coding/sketching tool, p5, into a project
- [svelte-windicss-preprocess](https://github.com/voorjaar/svelte-windicss-preprocess) is a Svelte preprocessor to compile tailwindcss at build time based on windicss compiler
- [MitzaCoder/svelte-boilerplate](https://github.com/MitzaCoder/svelte-boilerplate) features configurations for TypeScript, TailwindCSS, IE11 compatibility (with Babel) and lazy loaded modules.

**Want to share your Svelte Component with the world?** Head over to the [Components](https://sveltesociety.dev/components) page on the Svelte Society site. You can contribute by making [a PR to this file](https://github.com/svelte-society/sveltesociety.dev/blob/master/src/pages/components/components.json).

**Learning Resources**

- [lihautan's Svelte Actions Playlist](https://www.youtube.com/watch?v=ciaMT_MswzE&list=PLoKaNN3BjQX3Gl14MBygFf8buPIw9pAeK) teaches how actions work and how they can help solve common problems when developing Svelte applications
- [One-click Portfolio/Personal blog generator from dev.to API ](https://dev.to/shriji/one-click-portfolio-personal-blog-generator-from-dev-to-api-3apb) walks through creating a Sapper site that also fetches your articles from DEV.to using the API
- [How to Code a VS Code Extension](https://www.youtube.com/watch?v=a5DX5pQ9p5M) features Svelte as a way to render a custom UI within VS Code
- [This YouTube series on Plenti](https://www.youtube.com/watch?v=wyNC7R_VVyQ&list=PLbWvcwWtuDm12y3Hye6oKDwI2gAS0ccHW) walks through the new static site generator in detail

## See you next month!

Want to add your work to the Showcase? Want to contribute to Svelte? Check out the [Svelte Society](https://sveltesociety.dev/), [Reddit](https://www.reddit.com/r/sveltejs/) and [Discord](https://discord.com/invite/yy75DKs) to get involved!
