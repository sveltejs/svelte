---
title: Breaking changes
---

While Svelte 5 is a complete rewrite, we have done our best to ensure that most codebases can upgrade with a minimum of hassle. That said, there are a few small breaking changes which may require action on your part. They are listed here.

## Components are no longer classes

In Svelte 3 and 4, components are classes. In Svelte 5 they are functions and should be instantiated differently. If you need to manually instantiate components, you should use `mount` or `createRoot` (imported from `svelte`) instead. If you see this error using SvelteKit, try updating to the latest version of SvelteKit first, which adds support for Svelte 5. If you're using Svelte without SvelteKit, you'll likely have a `main.js` file (or similar) which you need to adjust:

```diff
+ import { createRoot } from 'svelte';
import App from './App.svelte'

- const app = new App({ target: document.getElementById("app") });
+ const app = createRoot(App, { target: document.getElementById("app") });

export default app;
```

`createRoot` returns an object with a `$set` and `$destroy` method on it. It does not come with an `$on` method you may know from the class component API. Instead, pass them via the `events` property on the options argument. If you don't need to interact with the component instance after creating it, you can use `mount` instead, which saves some bytes.

> Note that using `events` is discouraged — instead, [use callbacks](https://svelte-5-preview.vercel.app/docs/event-handlers)

As a stop-gap-solution, you can also use `createClassComponent` or `asClassComponent` (imported from `svelte/legacy`) instead to keep the same API after instantiating. If this component is not under your control, you can use the `legacy.componentApi` compiler option for auto-applied backwards compatibility (note that this adds a bit of overhead to each component).

### Server API changes

Similarly, components no longer have a `render` method when compiled for server side rendering. Instead, pass the function to `render` from `svelte/server`:

```diff
+ import { render } from 'svelte/server';
import App from './App.svelte';

- const { html, head } = App.render({ message: 'hello' });
+ const { html, head } = render(App, { props: { message: 'hello' } });
```

`render` also no longer returns CSS; it should be served separately from a CSS file.

### bind:this changes

Because components are no longer classes, using `bind:this` no longer returns a class instance with `$set`, `$on` and `$destroy` methods on it. It only returns the instance exports (`export function/const`) and, if you're using the `accessors` option, a getter/setter-pair for each property.

## Whitespace handling changed

Previously, Svelte employed a very complicated algorithm to determine if whitespace should be kept or not. Svelte 5 simplifies this which makes it easier to reason about as a developer. The rules are:

- Whitespace between nodes is collapsed to one whitespace
- Whitespace at the start and end of a tag is removed completely
- Certain exceptions apply such as keeping whitespace inside `pre` tags

As before, you can disable whitespace trimming by setting the `preserveWhitespace` option in your compiler settings or on a per-component basis in `<svelte:options>`.

## More recent browser required

Svelte now use Mutation Observers instead of IFrames to measure dimensions for `bind:clientWidth/clientHeight/offsetWidth/offsetHeight`. It also no longer listens to the `change` event on range inputs. Lastly, the `legacy` option was removed (or rather, replaced with a different set of settings).

## Changes to compiler options

- The `false`/`true` (already deprecated previously) and the `"none"` values were removed as valid values from the `css` option
- The `legacy` option was repurposed
- The `hydratable` option has been removed. Svelte components are always hydratable now
- The `tag` option was removed. Use `<svelte:options customElement="tag-name" />` inside the component instead
- The `loopGuardTimeout`, `format`, `sveltePath`, `errorMode` and `varsReport` options were removed

## The `children` prop is reserved

Content inside component tags becomes a [snippet prop](/docs/snippets) called `children`. You cannot have a separate prop by that name.

## Other breaking changes

### Stricter `@const` assignment validation

Assignments to destructured parts of a `@const` declaration are no longer allowed. It was an oversight that this was ever allowed.

### Stricter CSS `:global` selector validation

Previously, a selector like `.foo :global(bar).baz` was valid. In Svelte 5, this is a validation error instead. The reason is that in this selector the resulting CSS would be equivalent to one without `:global` - in other words, `:global` is ignored in this case.

### CSS hash position no longer deterministic

Previously Svelte would always insert the CSS hash last. This is no longer guaranteed in Svelte 5. This is only breaking if you [have very weird css selectors](https://stackoverflow.com/questions/15670631/does-the-order-of-classes-listed-on-an-item-affect-the-css).

### Renames of various error/warning codes

Various error and warning codes have been renamed slightly.

### Reduced number of namespaces

The number of valid namespaces you can pass to the compiler option `namespace` has been reduced to `html` (the default), `svg` and `foreign`.

### beforeUpdate change

`beforeUpdate` no longer runs twice on initial render if it modifies a variable referenced in the template.

### `contenteditable` behavior change

If you have a `contenteditable` node with a corresponding binding _and_ a reactive value inside it (example: `<div contenteditable=true bind:textContent>count is {count}</div>`), then the value inside the contenteditable will not be updated by updates to `count` because the binding takes full control over the content immediately and it should only be updated through it.

### `oneventname` attributes no longer accept string values

In Svelte 4, it was possible to specify event attributes on HTML elements as a string:

```svelte
<button onclick="alert('hello')">...</button>
```

This is not recommended, and is no longer possible in Svelte 5, where properties like `onclick` replace `on:click` as the mechanism for adding [event handlers](/docs/event-handlers).

### `null` and `undefined` become the empty string

In Svelte 4, `null` and `undefined` were printed as the corresponding string. In 99 out of 100 cases you want this to become the empty string instead, which is also what most other frameworks out there do. Therefore, in Svelte 5, `null` and `undefined` become the empty string.

### `bind:files` values can only be `null`, `undefined` or `FileList`

`bind:files` is now a two-way binding. As such, when setting a value, it needs to be either falsy (`null` or `undefined`) or of type `FileList`.
