
<script>
	let count = $state(0);

	let deferreds = [];

	class X {
		constructor(promise) {
			this.promise = promise;
		}
		
		get then() {
			count;

			return (resolve) => this.promise.then(() => count).then(resolve)
		}
	}

	function push() {
		const deferred = Promise.withResolvers();
		deferreds.push(deferred);
		return new X(deferred.promise);
	}
</script>

<button onclick={() => count += 1}>increment</button>
<button onclick={() => deferreds.pop()?.resolve(count)}>pop</button>

<svelte:boundary>
	<p>{await push()}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
