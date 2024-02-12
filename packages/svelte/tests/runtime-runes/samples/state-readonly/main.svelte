<script>
	import Component from './Component.svelte';

	let state = $state();
</script>

<button onclick={() => {
	state = {}
}}></button>
{#if state}
	<Component state={state} />
{/if}
