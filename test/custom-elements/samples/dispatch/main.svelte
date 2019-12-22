<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const sayHello = () => {
		dispatch('message', {
      text: 'Hello!'
    });
	};
</script>

<svelte:options tag="custom-element" />
<button on:click={sayHello}>
	Click to say hello
</button>
