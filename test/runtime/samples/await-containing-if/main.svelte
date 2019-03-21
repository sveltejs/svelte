<script>
	export let thePromise;
	export let show;
</script>

<div>
	{#await thePromise}
		<p>loading...</p>
	{:then theValue}
		{#if show}
			<p>the value is {theValue}</p>
		{/if}
	{:catch theError}
		<p>oh no! {theError.message}</p>
	{/await}
</div>