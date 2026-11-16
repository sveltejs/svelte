<script lang="ts">
	let input = $state(1);
	const load = (value: number) => Promise.resolve(value + 1);

	function observe(node: HTMLElement, value: number) {
		console.log(['install', value]);
		return {
			update(value: number) { console.log(['update', value]); },
			destroy() { console.log(['destroy']); }
		};
	}

	let value = $derived(await load(input));
</script>

<button onclick={() => input++}>update</button>
<input type="number" bind:value={input}>
<output>
	{#each [value] as item}<span>{item}</span>{/each}
	<p>{await load(value)}</p>
	<i use:observe={value}>{value}</i>
</output>
