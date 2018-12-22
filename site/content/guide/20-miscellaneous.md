---
title: Miscellaneous
---


### `<noscript>`

If you use `<noscript>` tags in a component, Svelte will only render them in SSR mode. The DOM compiler will strip them out, since you can't create the component without JavaScript, and `<noscript>` has no effect if JavaScript is available.