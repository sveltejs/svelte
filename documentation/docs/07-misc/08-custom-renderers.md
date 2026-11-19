---
title: Custom renderers
---

By default, Svelte components render to the DOM. A _custom renderer_ lets them render to something else instead — a WebGL scene, a native mobile UI, a terminal, a PDF document — while you keep writing ordinary Svelte components with state, props, control flow and everything else you're used to.

The renderer is a small object that tells Svelte how to create, arrange and update the nodes of the target environment. Svelte takes care of everything else.

This feature is currently experimental, and you must opt in by adding the `experimental.customRenderer` option wherever you [configure](/docs/kit/configuration) Svelte, usually `svelte.config.js`:

```js
/// file: svelte.config.js
export default {
	compilerOptions: {
		experimental: {
			customRenderer: true
		}
	}
};
```

The API may change before the experimental flag is removed.

## Choosing a renderer

With the option set to `true`, components still render to the DOM unless they say otherwise. A component chooses a renderer with [`<svelte:options>`](svelte-options), by pointing to the module that exports it:

```svelte
<!--- file: Scene.svelte --->
<svelte:options customRenderer="three-renderer" />

<script>
	let { speed } = $props();
	let rotation = $state(0);
</script>

<mesh rotation={[0, rotation, 0]} onclick={() => (rotation += speed)}>
	<boxGeometry args={[1, 1, 1]} />
</mesh>
```

> [!NOTE] `three-renderer` is a made-up package, used as an example throughout this page.

The elements in a custom renderer component — `<mesh>` and `<boxGeometry>` here — have no special meaning to Svelte. It passes their names and attributes to the renderer, which decides what to do with them.

The module path is resolved like any other import in the component, so it can be a package name, an alias, or a path relative to the component (`customRenderer="./renderer.js"`).

### Setting a default renderer

If most of your components use the same renderer, you can make it the default by passing the module path instead of `true`:

```js
/// file: svelte.config.js
export default {
	compilerOptions: {
		experimental: {
			customRenderer: 'three-renderer'
		}
	}
};
```

Individual components can still choose a different renderer, or use the DOM with `<svelte:options customRenderer={null} />`.

Every component imports the default renderer module, so this path can't be relative — it would be resolved relative to each component, rather than relative to your config file. Use a package name, an alias such as `$lib/renderer.js`, or an absolute path.

### Choosing a renderer by file

For more control, pass a function. It receives the filename of each component, and returns the renderer module for that component, or `null` (or `undefined`) for the DOM:

```js
/// file: svelte.config.js
export default {
	compilerOptions: {
		experimental: {
			customRenderer: ({ filename }) => {
				return filename.includes('/src/scene/') ? 'three-renderer' : null;
			}
		}
	}
};
```

Since the function knows which file it's choosing for, it can also return a path relative to that file. A `<svelte:options customRenderer={...}>` in a component takes precedence over the function.

## Mounting

You can use a custom renderer component inside a regular DOM app just like any other component — the next section explains how this works:

```svelte
<!--- file: App.svelte --->
<script>
	import Scene from './Scene.svelte';
</script>

<h1>My scene</h1>

<canvas width="800" height="600">
	<Scene speed={0.1} />
</canvas>
```

To render an app entirely with a custom renderer, pass the renderer to [`mount`](svelte#mount), along with a target created by that renderer:

```js
import { mount } from 'svelte';
import renderer from 'three-renderer';
import Scene from './Scene.svelte';

const root = renderer.createFragment();

mount(Scene, {
	target: root,
	renderer,
	props: { speed: 0.1 }
});

// `root` now contains the scene's nodes
```

`unmount`, component exports and `props` work as they do with the DOM.

## Mixing renderers

Components that use different renderers can be freely nested. A page can contain a 3D scene, and the scene can in turn contain DOM content, such as HTML labels positioned over the 3D objects. Context, props, snippets, [error boundaries](svelte-boundary) and reactivity all work across the boundary.

The place where content from one renderer appears inside content from another is called a _crossing_. The outer renderer is the _host_, and the inner one is the _guest_. At each crossing, Svelte needs two things:

- a `container`, owned by the guest, that the guest's content is rendered into
- optionally, a `node` owned by the host, that represents the guest's content in the host's tree. If there isn't one, Svelte inserts an empty text node

Renderers provide these through two optional methods, `embed` and `host`:

- `embed` is called on the guest. It means "I know how to put my content inside another renderer's tree"
- `host` is called on the host. It means "I know how to make room for another renderer's content inside my tree"

Svelte first tries the guest's `embed`, then the host's `host`. If neither exists, it throws an error. The DOM doesn't have either method, so in a mixed app it's always the custom renderer that provides them:

| Situation                              | Method that is called                   | Example                                  |
| -------------------------------------- | --------------------------------------- | ---------------------------------------- |
| Custom renderer content inside the DOM | the custom renderer's `embed`           | a WebGL scene in a regular page          |
| DOM content inside a custom renderer   | the custom renderer's `host`            | HTML labels floating over a 3D scene     |
| Renderer A's content inside renderer B | A's `embed`, or B's `host` if A has none | a chart renderer inside a native app     |

In other words: implement `embed` if your renderer will be used inside DOM apps, which is the case for most renderers. Implement `host` if DOM content (or another renderer's content) should be able to appear inside your renderer's tree.

### `embed`

`embed` receives the `host` renderer (`null` for the DOM), along with the `parent` and `anchor` of the position the content is rendered at. Here's how a canvas renderer might use it to render into a `<canvas>` element written by the user, or to create its own canvas otherwise:

```js
// @noErrors
embed({ host, parent }) {
	if (host !== null) {
		throw new Error('The canvas renderer can only be used inside the DOM');
	}

	const canvas = parent instanceof HTMLCanvasElement ? parent : document.createElement('canvas');
	const scene = create_scene(canvas);

	return {
		// only insert a canvas if we created one
		node: canvas === parent ? undefined : canvas,
		// the scene's root node, which the content is rendered into
		container: scene.root,
		// called once the content has been removed
		destroy: () => scene.dispose()
	};
}
```

As in this example, throwing an error is the best way to reject a position your renderer doesn't support. It's also how you can express requirements like "only inside a `<canvas>`".

### `host`

`host` is the mirror image. It receives the `guest` renderer (`null` for the DOM), and returns a `node` from your renderer to put in your tree, and a `container` owned by the guest:

```js
// @noErrors
host({ guest }) {
	if (guest !== null) {
		throw new Error('Only DOM content can be rendered inside a scene');
	}

	// a scene object that displays a DOM element as an overlay
	const overlay = create_overlay();

	return {
		node: overlay,
		container: overlay.element,
		destroy: () => overlay.dispose()
	};
}
```

### Rules for crossings

- `embed` and `host` are called once for each crossing, synchronously, when the component (or snippet) is created. Each instance of a component gets its own call.
- `parent` may not be attached to anything yet. If the component is at the top level of its parent's markup, `parent` is a fragment that hasn't been inserted yet, so don't measure layout or assume the page is connected inside these methods. If the component is directly inside an element, such as the `<canvas>` above, `parent` is that element.
- Svelte inserts and removes the `node` in the host's tree, and inserts and removes the content in the `container`. `destroy` is called after all of that, so only use it to release your own resources — don't remove the `node` or the content yourself.
- Several crossings can share a container, for example several scenes drawn into the same canvas. Svelte keeps their content in the same order as their nodes in the host tree, including when they're reordered by a keyed `{#each}` block.
- DOM event handlers like `onclick` work inside a DOM container, even if the container isn't part of the page. Events don't propagate from one renderer to another.
- Snippets can be passed between renderers, as long as they were created by a component compiled with `experimental.customRenderer`. Snippets created with [`createRawSnippet`](svelte#createRawSnippet) can't be rendered by a custom renderer.

## What's supported

Custom renderer components support most of Svelte, including runes, props, [snippets](snippet), components, [context](context), [`{#if}`](if), [`{#each}`](each), [`{#key}`](key) and [`{#await}`](await) blocks, [`<svelte:boundary>`](svelte-boundary), [`<svelte:element>`](svelte-element), [actions](use), [attachments](@attach), [`await` expressions](await-expressions), and `bind:` on components.

Attributes, including `class`, `style`, `class:` and `style:`, are passed to the renderer as attributes (see [Writing a renderer](#Writing-a-renderer)). Event attributes like `onclick` are passed to the renderer's `addEventListener`.

Some features only make sense with the DOM, and cause a compile error in custom renderer components:

- `bind:` on elements
- [transitions](transition) (`transition:`, `in:` and `out:`) and [animations](animate) (`animate:`)
- the legacy [`on:`](legacy-on) directive
- [`{@html ...}`](@html)
- [`<svelte:head>`](svelte-head), [`<svelte:window>`](svelte-window), [`<svelte:document>`](svelte-document) and [`<svelte:body>`](svelte-body)
- `<svelte:options css="injected" />`

### Styles

Svelte still scopes a custom renderer component's `<style>`, adding a class like `svelte-xyz123` to the elements it applies to, but it doesn't inject the styles into the page — whether your renderer can make use of CSS is up to the renderer.

If `css: 'injected'` is set in your compiler options (as it is in development with some setups), it's ignored for custom renderer components. Setting `<svelte:options css="injected" />` in a custom renderer component is an error.

### Server-side rendering

Custom renderer components render nothing during server-side rendering. They're created in the browser, after the page has loaded. The DOM around them is server-rendered and hydrated as usual.

## Writing a renderer

A renderer module's default export is an object created with `createRenderer` from `svelte/renderer`. Here's a complete renderer that renders to plain JavaScript objects, which is a good starting point for experimenting. A real renderer would call into the platform it targets instead — creating native views, scene objects, and so on.

```js
/// file: renderer.js
import { createRenderer } from 'svelte/renderer';

/** Removes a node from its parent, if it has one */
function detach(node) {
	if (node.parent) {
		node.parent.children.splice(node.parent.children.indexOf(node), 1);
		node.parent = null;
	}
}

export default createRenderer({
	createFragment: () => ({ type: 'fragment', children: [], parent: null }),
	createElement: (name) => ({
		type: 'element',
		name,
		attributes: {},
		listeners: {},
		children: [],
		parent: null
	}),
	createText: (data) => ({ type: 'text', data, parent: null }),
	createComment: (data) => ({ type: 'comment', data, parent: null }),

	getNodeType: (node) => node.type,
	getText: (node) => node.data,
	setText: (node, text) => {
		node.data = text;
	},

	getAttribute: (element, name) => element.attributes[name] ?? null,
	setAttribute: (element, name, value) => {
		element.attributes[name] = value;
	},
	removeAttribute: (element, name) => {
		delete element.attributes[name];
	},

	getFirstChild: (node) => node.children[0] ?? null,
	getLastChild: (node) => node.children.at(-1) ?? null,
	getNextSibling: (node) => {
		const siblings = node.parent?.children ?? [];
		return siblings[siblings.indexOf(node) + 1] ?? null;
	},
	getParent: (node) => node.parent,

	insert: (parent, node, anchor) => {
		// inserting a fragment inserts its children, and leaves it empty
		const nodes = node.type === 'fragment' ? node.children.splice(0) : [node];

		for (const child of nodes) detach(child);

		const index = anchor ? parent.children.indexOf(anchor) : parent.children.length;
		parent.children.splice(index, 0, ...nodes);

		for (const child of nodes) child.parent = parent;
	},
	remove: (node) => detach(node),

	addEventListener: (element, type, handler) => {
		(element.listeners[type] ??= new Set()).add(handler);
	},
	removeEventListener: (element, type, handler) => {
		element.listeners[type]?.delete(handler);
	}
});
```

The following sections describe what Svelte expects from each method.

### Nodes

Svelte works with four kinds of node: fragments, elements, text nodes and comments. They can be whatever kind of object makes sense for your renderer.

- `createFragment()` creates a fragment, a temporary container for several nodes. When a fragment is inserted somewhere, its children are moved there and the fragment is left empty. Fragments are also used as mount targets
- `createElement(name)` creates an element with the given name, such as `'mesh'`
- `createText(data)` creates a text node
- `createComment(data)` creates a comment. Svelte uses comments as invisible markers, for example to remember where the content of an `{#if}` block goes, so they don't need to be displayed
- `getNodeType(node)` returns `'fragment'`, `'element'`, `'text'` or `'comment'`
- `getText(node)` returns the text of a text node, or the data of a comment
- `setText(node, text)` changes the text of a text node

### The tree

- `insert(parent, node, anchor)` inserts `node` into `parent` before `anchor`, or at the end if `anchor` is `null`. The node may already be in the tree, in which case it should be moved
- `remove(node)` removes a node from its parent
- `getParent(node)`, `getFirstChild(node)`, `getLastChild(node)` and `getNextSibling(node)` return the corresponding node, or `null`

### Attributes

- `setAttribute(element, name, value)` is called for every attribute, with the value as it is in the component — a number, an array, an object, a function and so on — rather than converted to a string. This includes attributes that are properties rather than attributes in the DOM, such as `value` and `checked`. Whether your renderer treats them as properties, attributes or something else is up to you
- `removeAttribute(element, name)` is called instead of `setAttribute` when the value is `null` or `undefined`
- `getAttribute(element, name)` returns the current value, or `null` if the attribute isn't set

`class` and `style` are always passed as strings. Svelte combines the `class` attribute with any `class:` directives and scoping class, and the `style` attribute with any `style:` directives, and sets the result in one go.

### Events

- `addEventListener(element, type, handler, options)` is called for event attributes like `onclick`, with `options` describing whether the listener is a capturing (`onclickcapture`) or passive listener. Call `handler` whenever the event happens — you can pass it whatever arguments make sense for your renderer, and they'll be passed on to the event handler in the component
- `removeEventListener(element, type, handler, options)` removes a listener. Like the DOM, Svelte doesn't call it when an element is removed: an element and its listeners are expected to be discarded together

### Crossings

`embed` and `host` are optional, and only needed if your renderer will be combined with the DOM or other renderers. See [Mixing renderers](#Mixing-renderers).

## TypeScript

If you're writing a renderer in TypeScript, pass the types of your nodes to `createRenderer`, so that each method's parameters are typed:

```ts
// @noErrors
import { createRenderer } from 'svelte/renderer';

const renderer = createRenderer<{
	fragment: SceneFragment;
	element: SceneObject;
	text: SceneText;
	comment: SceneMarker;
}>({
	// ...
});
```

If you don't, the node types are inferred from the return types of `createFragment`, `createElement`, `createText` and `createComment`, as long as those methods come first in the object. Passing them explicitly gives clearer error messages, and works in any order.

The `Renderer` type is exported from `svelte/renderer` too, for code that works with renderers, such as a function that wraps one. It takes the same record of node types: `Renderer<{ fragment: ...; element: ...; text: ...; comment: ... }>`.

## Running outside the browser

Many renderers target environments that aren't browsers, such as Node, native runtimes or test runners. In those environments, `svelte` normally resolves to its server-side implementation, which can't render components on the client.

To use custom renderers there, add the `svelte-custom-renderer` [resolve condition](https://nodejs.org/api/packages.html#conditional-exports). With Node, run it with `--conditions=svelte-custom-renderer`. If you're using a bundler, add `svelte-custom-renderer` to its list of resolve conditions. If the condition is missing, Svelte throws an error explaining this.
