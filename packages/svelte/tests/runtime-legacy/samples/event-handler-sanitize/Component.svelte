<script>
	import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
</script>

<button on:click={() => dispatch('event-name')}>toggle</button>
