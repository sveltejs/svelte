<script>
    import Child from "./Child.svelte";
    import { store } from "./store.svelte.js";

    const visible = $derived(store.get("visible"));
    const visible2 = $derived(visible);
</script>

<button onclick={() => store.set("visible", true)}>show</button>
<button onclick={() => store.set("visible", false)}>hide</button>
{#if visible2}
	<Child />
	<div>visible</div>
{/if}
