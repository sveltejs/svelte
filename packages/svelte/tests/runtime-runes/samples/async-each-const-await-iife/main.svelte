<script>
	async function get_host() {
		return 'example.com';
	}
</script>

{#each { length: 1 } as nothing}
	{@const host = await get_host()}
	<p>{(() => host)()}</p>
{/each}
