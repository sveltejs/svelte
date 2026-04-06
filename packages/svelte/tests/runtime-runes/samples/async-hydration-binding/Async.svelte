<script>
	let data = $derived(await Promise.resolve('test'));
</script>

<div data-resolved={data ? 'true' : 'false'}>
	{data}
</div>
