<script>
	function foo() {
		return 'foo';
	}

	async function bar() {
		return Promise.resolve('bar');
	}
</script>

<svelte:boundary>
	<p>{foo()} {await bar()}</p>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
