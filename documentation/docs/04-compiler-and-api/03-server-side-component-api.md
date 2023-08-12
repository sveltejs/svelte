---
title: 'Server-side component API'
---

```js
// @noErrors
const result = Component.render(...)
```

Unlike client-side components, server-side components don't have a lifespan after you render them — their whole job is to create some HTML and CSS. For that reason, the API is somewhat different.

A server-side component exposes a `render` method that can be called with optional props. It returns an object with `head`, `html`, and `css` properties, where `head` contains the contents of any `<svelte:head>` elements encountered.

You can import a Svelte component directly into Node using [`svelte/register`](/docs/svelte-register).

```js
// @noErrors
require('svelte/register');

const App = require('./App.svelte').default;

const { head, html, css } = App.render({
	answer: 42
});
```

The `.render()` method accepts the following parameters:

| parameter | default | description                                        |
| --------- | ------- | -------------------------------------------------- |
| `props`   | `{}`    | An object of properties to supply to the component |
| `options` | `{}`    | An object of options                               |

The `options` object takes in the following options:

| option    | default     | description                                                              |
| --------- | ----------- | ------------------------------------------------------------------------ |
| `context` | `new Map()` | A `Map` of root-level context key-value pairs to supply to the component |

```js
// @noErrors
const { head, html, css } = App.render(
	// props
	{ answer: 42 },
	// options
	{
		context: new Map([['context-key', 'context-value']])
	}
);
```
