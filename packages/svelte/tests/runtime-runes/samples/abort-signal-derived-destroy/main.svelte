<script lang="ts">
	import Child from './Child.svelte'

	let count = $state(0);
	let aborted = $state(0)
</script>

{aborted}

<button onclick={() => count++}>increment</button>

{#if count % 2 === 0}
	<Child {count} bind:aborted={aborted} />
{/if}
