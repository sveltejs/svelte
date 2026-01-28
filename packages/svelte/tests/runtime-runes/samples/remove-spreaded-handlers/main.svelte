<script>
	let checked = $state(true)
	let count = $state(0)

	const onclick = $derived(checked ? (() => { count++ }) : undefined)
</script>

<p>
	{count}
</p>
<input type="checkbox" bind:checked />
<button {...{onclick}}></button>
