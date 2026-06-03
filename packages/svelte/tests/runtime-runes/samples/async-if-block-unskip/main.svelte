<script>
	let query = $state('');
	// changing the query results in a new promise with loading initialized to true
	const promise = $derived(push(query));

	const resolvers = [];
	function push(value) {
		if (!value) return Promise.resolve(value);

		const { promise, resolve } = Promise.withResolvers();

		resolvers.push(() => {
			// before resolving, set loading to false - this makes it run in a different batch
			loading = false;
			resolve(value);
		});

		let loading = $state(true);
		Object.defineProperty(promise, 'loading', {
			get() {
				return loading;
			}
		});

		return promise
	}
</script>

{query} {await promise}

{#if !promise.loading}
	{query}
{/if}

{#if !promise.loading}
	{await query}
{/if}

<button onclick={() => query = 'search'}>load</button>
<button onclick={() => resolvers.shift()?.()}>resolve</button>
