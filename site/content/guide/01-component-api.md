---
title: Component API
---

As we saw above, you create a component instance with the `new` keyword:

```js
/* { filename: 'main.js' } */
import MyComponent from './MyComponent.html';

const component = new MyComponent({
	// `target` is the only required option – the element
	// to render the component to
	target: document.querySelector('main'),

	// `data` is optional. A component can also have
	// default data – we'll learn about that later.
	data: {
		questions: [
			'life',
			'the universe',
			'everything'
		],
		answer: 42
	}
});
```

Every Svelte component instance has a small number of methods you can use to control it, in addition to any [custom methods](guide#custom-methods) you add.


### component.set(state)

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
