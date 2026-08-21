<script>
	let fail = $state(false);

	function error() {
		throw new Error('oops');
	}

	function attachment() {
		console.log('attachment');
	}
</script>

<svelte:boundary>
	{fail ? error() : 'all good'}
	<button onclick={() => fail = true}>fail</button>
	
	{#snippet failed()}
		<div {@attach attachment}>oops!</div>
	{/snippet}
</svelte:boundary>
