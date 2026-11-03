<script>
	let count = $state(0);
	const doubled = $derived(count * 2);
	let open = $state(false);

	const deferred = Promise.withResolvers();

	function wait(value) {
		return deferred.promise.then(() => value);
	}
</script>

<button onclick={() => count++}>increment</button>
<button onclick={() => (open = true)}>open</button>
<button onclick={() => deferred.resolve()}>resolve</button>

{#if count > 0}
	<p>{await wait(doubled)}</p>
{/if}

{#if open}
	<p>doubled {doubled}, count {count}</p>
{/if}
