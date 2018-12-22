---
title: Custom elements
---

[Custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements) are an emerging web standard for creating DOM elements that encapsulate styles and behaviours, much like Svelte components. They are part of the [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) family of specifications.

> Most browsers need [polyfills](https://www.webcomponents.org/polyfills) for custom elements. See [caniuse](https://caniuse.com/#feat=custom-elementsv1) for more details

Svelte components can be used as custom elements by doing the following:

1. Declaring a `tag` name. The value must contain a hyphen (`hello-world` in the example below)
2. Specifying `customElement: true` in the compiler configuration

```html
<!-- { filename: 'HelloWorld.html', repl: false } -->
<h1>Hello {name}!</h1>

<script>
	export default {
		tag: 'hello-world'
	};
</script>
```

Importing this file will now register a globally-available `<hello-world>` custom element that accepts a `name` property:

```js
import './HelloWorld.html';
document.body.innerHTML = `<hello-world name="world"/>`;

const el = document.querySelector('hello-world');
el.name = 'everybody';
```

See [svelte-custom-elements.surge.sh](http://svelte-custom-elements.surge.sh/) ([source here](https://github.com/sveltejs/template-custom-element)) for a larger example.

The compiled custom elements are still full-fledged Svelte components and can be used as such:

```js
el.get().name === el.name; // true
el.set({ name: 'folks' }); // equivalent to el.name = 'folks'
```

One crucial difference is that styles are *fully encapsulated* — whereas Svelte will prevent component styles from leaking *out*, custom elements use [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM) which also prevents styles from leaking *in*.

### Using `<slot>`

Custom elements can use [slots](guide#composing-with-slot) to place child elements, just like regular Svelte components.

### Firing events

You can dispatch events inside custom elements to pass data out:

```js
// inside a component method
const event = new CustomEvent('message', {
	detail: 'Hello parent!',
	bubbles: true,
	cancelable: true,
	composed: true // makes the event jump shadow DOM boundary
});

this.dispatchEvent(event);
```

Other parts of the application can listen for these events with `addEventListener`:

```js
const el = document.querySelector('hello-world');
el.addEventListener('message', event => {
	alert(event.detail);
});
```

> Note the `composed: true` attribute of the custom event. It enables the custom DOM event to cross the shadow DOM boundary and enter into main DOM tree.

### Observing properties

Svelte will determine, from the template and `computed` values, which properties the custom element has — for example, `name` in our `<hello-world>` example. You can specify this list of properties manually, for example to restrict which properties are 'visible' to the rest of your app:

```js
export default {
	tag: 'my-thing',
	props: ['foo', 'bar']
};
```

### Compiler options

Earlier, we saw the use of `customElement: true` to instruct the Svelte compiler to generate a custom element using the `tag` and (optional) `props` declared inside the component file.

Alternatively, you can pass `tag` and `props` direct to the compiler:

```js
const { js } = svelte.compile(source, {
	customElement: {
		tag: 'overridden-tag-name',
		props: ['yar', 'boo']
	}
});
```

These options will override the component's own settings, if any.

### Transpiling

* Custom elements use ES2015 classes (`MyThing extends HTMLElement`). Make sure you don't transpile the custom element code to ES5, and use a ES2015-aware minifier such as [uglify-es](https://www.npmjs.com/package/uglify-es).

* If you do need ES5 support, make sure to use `Reflect.construct` aware transpiler plugin such as [babel-plugin-transform-builtin-classes](https://github.com/WebReflection/babel-plugin-transform-builtin-classes) and a polyfill like [custom-elements-es5-adapterjs](https://github.com/webcomponents/webcomponentsjs#custom-elements-es5-adapterjs).
