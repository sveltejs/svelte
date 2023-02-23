<script>
	let Component;
	export let array;
	export let default_value_1;
	export let default_value_2;
	export let default_value_3;
	export let default_value_4;
	export let default_value_5;
	export let default_value_6;
</script>

<Component>
	<svelte:fragment let:a={default_value_6}>
		{#each array as default_value_5}
			{#each array as { a = default_value_1, b: { b = [default_value_2, default_value_3], c: [c = default_value_4] }, d = default_value_5, e = default_value_6 }}
				{a}{b}{c}{d}{e}
			{/each}
		{/each}
	</svelte:fragment>
</Component>
