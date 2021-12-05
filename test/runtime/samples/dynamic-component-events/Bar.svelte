<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<button on:click='{() => dispatch("select", { id: "bar" })}'>select bar</button>