# @sveltejs/tree-renderer

A helper for writing [Svelte custom renderers](https://svelte.dev/docs/svelte/svelte-renderer) that manages the tree for the user.

`createRenderer` needs you to answer Svelte's questions about your tree: what's the first child of this node, what's its next sibling, what's its parent, and so on. With this helper, you create your platform's objects and apply each change to them, and the tree renderer keeps track of the tree for you.

```js
import { mount } from 'svelte';
import { createTreeRenderer } from '@sveltejs/tree-renderer';
import App from './App.svelte';

const renderer = createTreeRenderer({
  createElement: (name) => new View(name),
  createText: (text) => new Label(text),
  insert: (parent, node, anchor, index) => parent.insertChild(node, index),
  remove: (parent, node) => parent.removeChild(node),
  setAttribute: (element, key, value) => element.setProp(key, value),
  removeAttribute: (element, key) => element.clearProp(key),
  setText: (node, text) => node.setText(text),
  addEventListener: (element, type, handler) => element.on(type, handler),
  removeEventListener: (element, type, handler) => element.off(type, handler)
});

mount(App, { renderer, target: renderer.createRoot(platform_root) });
```

## Mounting

Always mount into a root created with `renderer.createRoot(...)`, passing your platform's root object:

```js
const screen = new Screen();

mount(App, { renderer, target: renderer.createRoot(screen) });
```

Don't mount into `renderer.createFragment()`. With `createRenderer`, the renderer's nodes are your platform's nodes, so a fragment is a fine root. With the tree renderer, `createFragment` is what Svelte creates its internal template fragments with. Those have no platform object, and changes to their children are never passed to your platform, because they're only scaffolding that gets inserted elsewhere. If you mount into one, Svelte renders into it without any error, but your platform never receives anything.

`createRoot` gives the fragment your platform's root as its `node`. That's how the tree renderer knows it's a real root, and passes changes to its children to your `insert` and `remove`, with your root object as the `parent`.

The methods are the platform-specific half of `createRenderer`, and they're called with your own objects, after the tree renderer has updated its tree. Like `createRenderer`'s methods, they're all required, except `embed` and `host` (see below).

- Only elements, text nodes and roots reach your platform. Svelte's internal fragments and the comments it uses as anchors are handled by the tree renderer.
- `insert` gives you both the sibling the node was inserted before (`anchor`, or `null` if it's the last child) and its position among its siblings (`index`), so use whichever your platform works with. A move arrives as `remove` followed by `insert`.
- `remove` gets the parent the node was removed from.

The types of your objects are inferred from `createElement` and `createText`, as long as those come first. The root is assumed to be an element. Alternatively, pass them as the type argument, like with `createRenderer`: `createTreeRenderer<{ element: View; text: Label; root: Window }>({ ... })`.

## Tree nodes

Svelte works with the tree renderer's nodes, so they're what you get in attachments. Each one points to your object through `node`:

```svelte
<input {@attach (input) => input.node.focus()} />
```

## Combining with other renderers

`embed` and `host` work as with `createRenderer`, with your own objects:

```js
createTreeRenderer({
  // ...

  // this renderer's content inside the DOM (`host` is `null`) or another renderer
  embed({ host }) {
    const container = new View('root');
    const node = host === null ? mount_view_into_dom(container) : undefined;
    return { node, container, destroy() {} };
  },

  // DOM content (`guest` is `null`), or another renderer's, inside this one
  host({ guest }) {
    const container = document.createElement('div');
    return { node: new DomView(container), container, destroy() {} };
  }
});
```

- `embed` returns your root as `container`. `node` belongs to the host renderer, which is the DOM in this example.
- `host` returns your element as `node`, and it's inserted into your tree like any other element. Its tree node has an empty `name`, because the tree renderer doesn't know what you called it.
- Without `embed` or `host`, combining this renderer with others throws.
