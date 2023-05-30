<script>
	let arrFunc = () => {
		return [{ value: 0 }, { value: 1 }, { value: 2 }];
	};
	export let bindings = [];
</script>

{#each arrFunc() as obj}
	<p bind:this={bindings[obj.value]}>{obj.value}</p>
{/each}
