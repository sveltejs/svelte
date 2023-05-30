<script>
	let flip = true;
	let arrFunc = () => {
		flip = !flip;
		if (!flip) {
			return [{ value: 1 }];
		} else {
			return [{ value: 2 }];
		}
	};
	export let bindings = {};
</script>

<button
	on:click={() => {
		arrFunc = arrFunc;
	}}>Flip</button
>
{#each arrFunc() as { value }}
	<p bind:this={bindings[value]}>{value}</p>
{/each}
