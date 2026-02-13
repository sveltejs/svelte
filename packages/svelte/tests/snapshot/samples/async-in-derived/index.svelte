<script>
	let yes1 = $derived(await 1);
	let yes2 = $derived(foo(await 1));
	let no1 = $derived.by(async () => {
		return await 1;
	});
	let no2 = $derived(async () => {
		return await 1;
	});
</script>

{#if true}
	{@const yes1 = await 1}
	{@const yes2 = foo(await 1)}
	{@const no1 = (async () => {
		return await 1;
	})()}
	{@const no2 = (async () => {
		return await 1;
	})()}
{/if}
