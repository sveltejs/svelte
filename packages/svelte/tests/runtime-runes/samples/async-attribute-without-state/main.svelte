<svelte:boundary>
	<p data-foo={await 'bar'}>hello</p>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
