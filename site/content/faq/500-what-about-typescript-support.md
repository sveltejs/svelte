---
question: What about Typescript support?
---

You need to install a preprocessor such as [svelte-preprocess](https://github.com/sveltejs/svelte-preprocess). Work is ongoing to improve [IDE support](https://github.com/sveltejs/language-tools/issues/83). You can also run type checking from the command line with [svelte-check](https://www.npmjs.com/package/svelte-check).

To declare the type of a reactive variable in a Svelte template, you can use the following syntax:
```
let x: number;
$: x = count + 1;
```
