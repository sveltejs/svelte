<script lang="ts">
	import Child from './Child.svelte';

	let show = $state(true);
</script>

<button onclick={() => (show = !show)}>toggle</button>

{#if show}
	<Child />
{/if}
