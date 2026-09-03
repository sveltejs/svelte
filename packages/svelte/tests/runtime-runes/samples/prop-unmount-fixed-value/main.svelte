<script>
	import Child from "./Child.svelte"
	
	let value = $state(false)

	function toggleValue() {
		value = !value
		console.log("PARENT: set value to", value)
	}
</script>

<button onclick={toggleValue}>Toggle value</button>

{#if value}
	<Child {value} />
{/if}
