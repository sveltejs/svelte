<script>
	let max = $state(12);
	let value = $state(12);

	$effect(() => {
		if (value > max) value = max;
	});
</script>

<input type="number" bind:value={max} />

<progress {value} {max}></progress>
<progress {...{ value, max }}></progress>
<svelte:element this={'progress'} {value} {max}></svelte:element>

<meter {value} {max}></meter>
<meter {...{ value, max }}></meter>
<svelte:element this={'meter'} {value} {max}></svelte:element>

<progress value={0}></progress>
<progress {...{ value: 0 }}></progress>
