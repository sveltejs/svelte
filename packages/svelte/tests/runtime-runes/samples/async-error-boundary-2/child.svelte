<script>
	import { get } from "./main.svelte";

    let { error } = $props();
    const context = get()
</script>

{#if error}
    <p>caught: {await error} ({context})</p>
{:else}
	{await Promise.reject('catch me')}
{/if}
