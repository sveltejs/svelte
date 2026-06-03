<script>
	import Child from "./Child.svelte"

	let count = $state(0);
</script>

<button onclick={()=>count++}></button>
<svelte:boundary>
	<Child />

	{#snippet failed()}
		<div>{count}</div>
	{/snippet}
</svelte:boundary>
