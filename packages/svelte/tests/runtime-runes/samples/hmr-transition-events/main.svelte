<script>
	import Drawer from "./Drawer.svelte"


	let visible = $state(false);
</script>

<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	<Drawer />
{/if}
