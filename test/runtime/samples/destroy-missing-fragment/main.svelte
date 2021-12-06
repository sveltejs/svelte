<script>
	import { onMount } from 'svelte';
    let e;
    onMount(() => {
        e.remove();
    })
</script>

<div bind:this={e} />