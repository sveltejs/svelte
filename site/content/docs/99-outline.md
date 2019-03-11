---
title: Outline
---

(This isn't the actual documentation, this is just me getting my thoughts straight so that we can create the documentation.)

I think it makes sense to split the docs into compile time (`svelte.preprocess` and `svelte.compile`), then run time (component API, `svelte`, `svelte/store`, `svelte/motion`, etc). I'm not sure where template syntax, style scoping (and `:global(...)`), `context="module"` etc goes.

### Compile time

* `const preprocessed = await svelte.preprocess(source, options);`
* `const result = svelte.compile(source, options);`


### Run time

#### Client-side component API

* `const component = new Component(options);`
* `component.$set(...);`
* `component.$on(event, callback);`
* `component.$destroy();`
* `component.x` if `accessors: true`


#### Server-side component API

* `const result = Component.render(...)`


#### svelte

* lifecycle methods, tick, context
* SSR behaviour


#### svelte/store

* writable, readable, derive, get

#### svelte/motion

* spring, tweened

#### svelte/transition

#### svelte/animation (TODO make this)

#### svelte/easing