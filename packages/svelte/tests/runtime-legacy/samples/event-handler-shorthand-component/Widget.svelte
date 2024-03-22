<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<button on:click='{() => dispatch("foo", { answer: 42 })}'>click me</button>
