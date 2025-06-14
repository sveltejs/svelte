<script>
	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => deferred.reject(new Error('oops!'))}>step 1</button>
<button onclick={() => deferred = Promise.withResolvers()}>step 2</button>
<button onclick={() => deferred.resolve('wheee')}>step 3</button>

<svelte:boundary>
	<h1>{await deferred.promise}</h1>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}

	{#snippet failed(error, reset)}
		<p>{error.message}</p>
		<button data-id="reset" onclick={reset}>reset</button>
	{/snippet}
</svelte:boundary>
