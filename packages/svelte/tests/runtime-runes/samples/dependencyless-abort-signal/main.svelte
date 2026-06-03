<script>
	import Component from './Component.svelte'

	let show = $state(true)
</script>

<button onclick={() => (show = !show)}>click</button>
{#if show}
	<Component />
{/if}
