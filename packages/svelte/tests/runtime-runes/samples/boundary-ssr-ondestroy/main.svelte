<script>
	import Child from './Child.svelte';
	let { log } = $props();
</script>

<svelte:boundary>
	<Child name="sibling" {log} />
	<Child name="thrower" {log} fail />
	{#snippet failed()}<p>failed</p>{/snippet}
</svelte:boundary>
<Child name="outside" {log} />
