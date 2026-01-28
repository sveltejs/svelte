<svelte:boundary>
	<div class:one={await true} {...{}}>one</div>
	<div class:two={await true}>two</div>

	<div style:color={await 'red'} {...{}}>red</div>
	<div style:color={await 'blue'}>blue</div>

	{#snippet pending()}
		loading
	{/snippet}
</svelte:boundary>
