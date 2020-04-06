---
title: Component events
---

Components can also dispatch events. To do so, they must create an event dispatcher. Update `Inner.svelte`:

```html
<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function sayHello() {
		dispatch('message', {
			text: 'Hello!'
		});
	}
</script>
```

> `createEventDispatcher` must be called when the component is first instantiated — you can't do it later inside e.g. a `setTimeout` callback. This links `dispatch` to the component instance.

Notice how the `App.svelte` component, that is including `Inner.svelte`, is listening to the messages dispatched by `Inner` thanks to the `on:message` attribute.

> Without this attribute, messages would still be dispatched, but the App would not react to it. Try removing the `on:message` attribute and pressing the button again!
