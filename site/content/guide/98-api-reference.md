---
title: API reference
---

## TODO MAKE THIS CURRENT, INCLUDE svelte, svelte/store, ETC ETC

As we saw above, you create a component instance with the `new` keyword:

```js
/* { filename: 'main.js' } */
import App from './App.html';

const component = new App({
	// `target` is the only required option. This is the
	// DOM element your component will be appended to
	target: document.querySelector('main'),

	// `anchor` is optional.
	// The component is inserted immediately before this
	// DOM element, which must be a child of `target`
	anchor: document.querySelector('main #child'),

	// `props` is optional. A component can also have
	// default props – we'll learn about that later.
	props: {
		questions: [
			'life',
			'the universe',
			'everything'
		],
		answer: 42
	}
});
```

Normally, you'd interact with a component by getting and setting *props*:

```js
console.log(component.answer); // 42
component.answer =

Every Svelte component instance has three built-in methods:


### component.$set(props)

This updates the component's state with the new values provided and causes the DOM to update. `state` must be a plain old JavaScript object (POJO). Any properties *not* included in `state` will remain as they were.

```js
component.set({
	questions: [
		'why is the sky blue?',
		'how do planes fly?',
		'where do babies come from?'
	],
	answer: 'ask your mother'
});
```


### component.get()

Returns the component's current state:

```js
const { questions, answer } = component.get();
console.log(answer); // 'ask your mother'
```

This will also retrieve the value of [computed properties](guide#computed-properties).

> Previous versions of Svelte allowed you to specify a key to retrieve a specific value — this was removed in version 2.

### component.on(eventName, callback)

Allows you to respond to *events*:

```js
const listener = component.on('thingHappened', event => {
	console.log(`A thing happened: ${event.thing}`);
});

// some time later...
listener.cancel();
```

Each component has three built-in events, corresponding to their [lifecycle hooks](guide#lifecycle-hooks):

```js
component.on('state', ({ changed, current, previous }) => {
	console.log('state changed', current);
});

component.on('update', ({ changed, current, previous }) => {
	console.log('DOM updated after state change', current);
});

component.on('destroy', () => {
	console.log('this component is being destroyed');
});
```


### component.fire(eventName, event)

The companion to `component.on(...)`:

```js
component.fire('thingHappened', {
	thing: 'this event was fired'
});
```

At first glance `component.on(...)` and `component.fire(...)` aren't particularly useful, but it'll become more so when we learn about [nested components](guide#nested-components) and [component events](guide#component-events).


### component.destroy()

Removes the component from the DOM and removes any event listeners that were created. This will also fire a `destroy` event:

```js
component.on('destroy', () => {
	alert('goodbye!'); // please don't do this
});

component.destroy();
```


### component.options

The options used to instantiate the component are available in `component.options`.

```html
<!-- { title: 'component.options' } -->
Check the console.

<script>
	export default {
		oncreate() {
			console.log(this.options);
		}
	};
</script>
```

This gives you access to standard options like `target` and `data`, but can also be used to access any other custom options you may choose to implement for your component.


### component.root

In [nested components](guide#nested-components), each component has a `root` property pointing to the top-level root component – that is, the one instantiated with `new MyComponent({...})`.

> Earlier versions of Svelte had a `component.observe(...)` method. This was removed in version 2, in favour of the `onstate` [lifecycle hook](guide#lifecycle-hooks), but is still available via [svelte-extras](https://github.com/sveltejs/svelte-extras).
