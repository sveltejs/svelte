<script>
	import { createEventDispatcher, getContext } from "svelte";

    let { count } = $props();
    const multiply = getContext('multiply');

    // Use legacy createEventDispatcher here to test that `events` property in `mount` works
    const dispatch = createEventDispatcher();
</script>

<button onclick={() => dispatch('update', count + 1 * multiply)}>{count}</button>
