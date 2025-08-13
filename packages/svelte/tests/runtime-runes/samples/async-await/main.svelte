<script>
	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => deferred = Promise.withResolvers()}>reset</button>
<button onclick={() => deferred.resolve("one")}>one</button>
<button onclick={() => deferred.resolve("two")}>two</button>
<button onclick={() => deferred.reject("reject")}>reject</button>

<svelte:boundary>
	{#await await deferred.promise + "_res"}
		waiting
	{:then res}
		{res}
	{:catch err}
		{err}_catch
	{/await}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
