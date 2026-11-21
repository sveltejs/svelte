<script lang="ts">
	import Child from './Child.svelte';
	let visible = $state(true);
</script>

<button onclick={() => (visible = !visible)}>toggle</button>
{#if visible}
	<Child />
{/if}
