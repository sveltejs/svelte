---
title: Custom elements
---

<!-- - [basically what we have today](https://svelte.dev/docs/custom-elements-api) -->

Svelte components can also be compiled to custom elements (aka web components) using the `customElement: true` compiler option. You should specify a tag name for the component using the `<svelte:options>` [element](svelte-options). Within the custom element you can access the host element via the [`$host`]($host) rune.

```svelte
<svelte:options customElement="my-element" />

<script>
	let { name = 'world' } = $props();
</script>

<h1>Hello {name}!</h1>
<slot />
```

You can leave out the tag name for any of your inner components which you don't want to expose and use them like regular Svelte components. Consumers of the component can still name it afterwards if needed, using the static `element` property which contains the custom element constructor and which is available when the `customElement` compiler option is `true`.

```js
// @noErrors
import MyElement from './MyElement.svelte';

customElements.define('my-element', MyElement.element);
```

Once a custom element has been defined, it can be used as a regular DOM element:

```js
document.body.innerHTML = `
	<my-element>
		<p>This is some slotted content</p>
	</my-element>
`;
```

Any [props](basic-markup#Component-props) are exposed as properties of the DOM element (as well as being readable/writable as attributes, where possible).

```js
// @noErrors
const el = document.querySelector('my-element');

// get the current value of the 'name' prop
console.log(el.name);

// set a new value, updating the shadow DOM
el.name = 'everybody';
```

Note that you need to list out all properties explicitly, i.e. doing `let props = $props()` without declaring `props` in the [component options](#Component-options) means that Svelte can't know which props to expose as properties on the DOM element.

## Component lifecycle

Custom elements are created from Svelte components using a wrapper approach. This means the inner Svelte component has no knowledge that it is a custom element. The custom element wrapper takes care of handling its lifecycle appropriately.

When a custom element is created, the Svelte component it wraps is _not_ created right away. It is only created in the next tick after the `connectedCallback` is invoked. Properties assigned to the custom element before it is inserted into the DOM are temporarily saved and then set on component creation, so their values are not lost. The same does not work for invoking exported functions on the custom element though, they are only available after the element has mounted. If you need to invoke functions before component creation, you can work around it by using the [`extend` option](#Component-options).

When a custom element written with Svelte is created or updated, the shadow DOM will reflect the value in the next tick, not immediately. This way updates can be batched, and DOM moves which temporarily (but synchronously) detach the element from the DOM don't lead to unmounting the inner component.

The inner Svelte component is destroyed in the next tick after the `disconnectedCallback` is invoked.

## Component options

When constructing a custom element, you can tailor several aspects by defining `customElement` as an object within `<svelte:options>` since Svelte 4. This object may contain the following properties:

- `tag: string`: an optional `tag` property for the custom element's name. If set, a custom element with this tag name will be defined with the document's `customElements` registry upon importing this component. Leave it out if you want to define the element yourself, for example in a [scoped custom element registry](#Scoped-custom-element-registries).
- `shadow`: an optional property to modify shadow root properties. It accepts the following values:
  - `"none"`: No shadow root is created. Note that styles are then no longer encapsulated, and you can't use slots.
  - `"open"`: Shadow root is created with the `mode: "open"` option.
  - [`ShadowRootInit`](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#options): You can pass a settings object that will be passed to `attachShadow()` when shadow root is created.
- `props`: an optional property to modify certain details and behaviors of your component's properties. It offers the following settings:
  - `attribute: string`: To update a custom element's prop, you have two alternatives: either set the property on the custom element's reference as illustrated above or use an HTML attribute. For the latter, the default attribute name is the lowercase property name. Modify this by assigning `attribute: "<desired name>"`.
  - `reflect: boolean`: By default, updated prop values do not reflect back to the DOM. To enable this behavior, set `reflect: true`.
  - `type: 'String' | 'Boolean' | 'Number' | 'Array' | 'Object'`: While converting an attribute value to a prop value and reflecting it back, the prop value is assumed to be a `String` by default. This may not always be accurate. For instance, for a number type, define it using `type: "Number"`
    You don't need to list all properties, those not listed will use the default settings.
- `extend`: an optional property which expects a function as its argument. It is passed the custom element class generated by Svelte and expects you to return a custom element class. This comes in handy if you have very specific requirements to the life cycle of the custom element or want to enhance the class to for example use [ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals#examples) for better HTML form integration.

```svelte
<svelte:options
	customElement={{
		tag: 'custom-element',
		shadow: {
			mode: import.meta.env.DEV ? 'open' : 'closed',
			clonable: true,
			// ...
		},
		props: {
			name: { reflect: true, type: 'Number', attribute: 'element-index' }
		},
		extend: (customElementConstructor) => {
			// Extend the class so we can let it participate in HTML forms
			return class extends customElementConstructor {
				static formAssociated = true;

				constructor() {
					super();
					this.attachedInternals = this.attachInternals();
				}

				// Add the function here, not below in the component so that
				// it's always available, not just when the inner Svelte component
				// is mounted
				randomIndex() {
					this.elementIndex = Math.random();
				}
			};
		}
	}}
/>

<script>
	let { elementIndex, attachedInternals } = $props();
	// ...
	function check() {
		attachedInternals.checkValidity();
	}
</script>

...
```

> [!NOTE] While Typescript is supported in the `extend` function, it is subject to limitations: you need to set `lang="ts"` on one of the scripts AND you can only use [erasable syntax](https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly) in it. They are not processed by script preprocessors.

## Scoped custom element registries

By default, custom elements are defined in the global `customElements` registry, which means that each tag name can only be used once per page. [Scoped custom element registries](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/CustomElementRegistry) solve this by letting you create independent registries, which can then be attached to a shadow root, a document or an element.

### Defining custom elements in a scoped registry

Leave out the `tag` option, and define the custom element class — available through the static `element` property — in the registry of your choice:

```svelte
<!--- file: MyElement.svelte --->
<script>
	let { name } = $props();
</script>

<h1>Hello {name}!</h1>
```

```js
/// file: registry.js
// @noErrors
import MyElement from './MyElement.svelte';

export const registry = new CustomElementRegistry();
registry.define('my-element', MyElement.element);
```

```js
// @noErrors
import { registry } from './registry.js';

const shadow = host.attachShadow({ mode: 'open', customElementRegistry: registry });
shadow.innerHTML = '<my-element name="world"></my-element>';
```

This way, whoever uses the element decides which registry it ends up in and under which name. If you publish custom elements as a library, consider exporting a function like `define(registry = customElements, name = 'my-element')` instead of defining them as a side effect of importing the component.

If you prefer to keep the definition inside the component file, you can use the [`extend` option](#Component-options) to get hold of the class — the function can use imports and declarations from `<script module>`, but nothing from the instance `<script>`:

```svelte
<!--- file: MyElement.svelte --->
<svelte:options
	customElement={{
		extend: (customElementConstructor) => {
			registry.define('my-element', customElementConstructor);
			return customElementConstructor;
		}
	}}
/>

<script module>
	import { registry } from './registry.js';
</script>
```

### Using elements from a scoped registry

To use elements from a scoped registry inside a custom element written with Svelte, attach the registry to its shadow root:

```svelte
<svelte:options
	customElement={{
		tag: 'my-app',
		shadow: { mode: 'open', customElementRegistry: registry }
	}}
/>

<script module>
	import { registry } from './registry.js';
</script>

<!-- defined by `registry`, not by the global `customElements` -->
<my-element name="world"></my-element>
```

Elements that a Svelte component creates inside — through its markup, `<svelte:element>` or `{@html ...}` — are then associated with the same registry as the target they're rendered into, just like elements created with `target.innerHTML` would be. The same applies when you [`mount`](imperative-component-api#mount) or [`hydrate`](imperative-component-api#hydrate) a component: if the `target` is associated with a scoped registry, the elements of the component are, too.

Note that, by default, a shadow root uses the global registry even if its host element was defined in a scoped registry. Also note that the scoped registry needs to contain the definitions of _all_ used custom elements within it, as browsers don't fall back to the global registry if they don't find a definition in the scoped registry.

## Caveats and limitations

Custom elements can be a useful way to package components for consumption in a non-Svelte app, as they will work with vanilla HTML and JavaScript as well as [most frameworks](https://custom-elements-everywhere.com/). There are, however, some important differences to be aware of:

- Styles are _encapsulated_, rather than merely _scoped_ (unless you set `shadow: "none"`). This means that any non-component styles (such as you might have in a `global.css` file) will not apply to the custom element, including styles with the `:global(...)` modifier
- Instead of being extracted out as a separate .css file, styles are inlined into the component as a JavaScript string
- Custom elements are not generally suitable for server-side rendering, as the shadow DOM is invisible until JavaScript loads
- In Svelte, slotted content renders _lazily_. In the DOM, it renders _eagerly_. In other words, it will always be created even if the component's `<slot>` element is inside an `{#if ...}` block. Similarly, including a `<slot>` in an `{#each ...}` block will not cause the slotted content to be rendered multiple times
- The deprecated `let:` directive has no effect, because custom elements do not have a way to pass data to the parent component that fills the slot
- Polyfills are required to support older browsers
- You can use Svelte's context feature between regular Svelte components within a custom element, but you can't use them across custom elements. In other words, you can't use `setContext` on a parent custom element and read that with `getContext` in a child custom element.
- Don't declare properties or attributes starting with `on`, as their usage will be interpreted as an event listener. In other words, Svelte treats `<custom-element oneworld={true}></custom-element>` as `customElement.addEventListener('eworld', true)` (and not as `customElement.oneworld = true`). If you want to dispatch events, use the [`$host`]($host) rune.
