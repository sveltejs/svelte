---
question: What about TypeScript support?
---

You need to install a preprocessor such as [svelte-preprocess](https://github.com/sveltejs/svelte-preprocess). You can run type checking from the command line with [svelte-check](https://www.npmjs.com/package/svelte-check).

To declare the type of a reactive variable in a Svelte template, you should use the following syntax:

```
let x: number;
$: x = count + 1;
```
