<script>
	import Component from "./Component.svelte";

	let toggle = $state(true);
</script>

<button onclick={() => toggle = !toggle}>toggle</button>

{#if toggle}
	<Component />
{/if}

