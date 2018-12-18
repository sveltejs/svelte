---
title: Server-side rendering
---

So far, we've discussed creating Svelte components *on the client*, which is to say the browser. But you can also render Svelte components in Node.js. This can result in better perceived performance as it means the application starts rendering while the page is still downloading, before any JavaScript executes. It also has SEO advantages in some cases, and can be beneficial for people running older browsers that can't or won't run your JavaScript for whatever reason.


### Using the compiler

If you're using the Svelte compiler, whether directly or via an integration like [rollup-plugin-svelte](https://github.com/rollup/rollup-plugin-svelte) or [svelte-loader](https://github.com/sveltejs/svelte-loader), you can tell it to generate a server-side component by passing the `generate: 'ssr'` option:

```js
const { js } = svelte.compile(source, {
	generate: 'ssr' // as opposed to 'dom', the default
});
```


### Registering Svelte

Alternatively, an easy way to use the server-side renderer is to *register* it:

```js
require('svelte/ssr/register');
```

Now you can `require` your components:

```js
const Thing = require('./components/Thing.html');
```

If you prefer to use a different file extension, you can pass options like so:

```js
require('svelte/ssr/register')({
	extensions: ['.svelte']
});
```


### Server-side API

Components have a different API in Node.js – rather than creating instances with `set(...)` and `get()` methods, a component is an object with a `render(data, options)` method:

```js
require('svelte/ssr/register');
const Thing = require('./components/Thing.html');

const data = { answer: 42 };
const { html, css, head } = Thing.render(data);
```

All your [default data](guide#default-data), [computed properties](guide#computed-properties), [helpers](guide#helpers) and [nested components](guide#nested-components) will work as expected.

Any `oncreate` functions or component methods will *not* run — these only apply to client-side components.

> The SSR compiler will generate a CommonJS module for each of your components – meaning that `import` and `export` statements are converted into their `require` and `module.exports` equivalents. If your components have non-component dependencies, they must also work as CommonJS modules in Node. If you're using ES2015 modules, we recommend the [`esm`](https://github.com/standard-things/esm) module for automatically converting them to CommonJS.



#### Using stores

If your components use [stores](guide#state-management), use the second argument:

```js
const { Store } = require('svelte/store.umd.js');

const { html } = Thing.render(data, {
	store: new Store({
		foo: 'bar'
	})
});
```


#### Rendering styles

You can also extract any [scoped styles](guide#scoped-styles) that are used by the component or its children:

```js
const { css } = Thing.render(data);
```

You could put the resulting `css` in a separate stylesheet, or include them in the page inside a `<style>` tag. If you do this, you will probably want to prevent the client-side compiler from including the CSS again. For the CLI, use the `--no-css` flag. In build tool integrations like `rollup-plugin-svelte`, pass the `css: false` option.



#### Rendering `<head>` contents

If your component, any of its children, use the `<svelte:head>` [component](guide#-head-tags), you can extract the contents:

```js
const { head } = Thing.render(data);
```
