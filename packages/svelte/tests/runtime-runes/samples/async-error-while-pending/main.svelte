<script>
	let count = $state(0);
	let threw = false;

	const resolvers = [];

	function push(value) {
		const { promise, resolve } = Promise.withResolvers();
		resolvers.push(() => resolve(value));
		return promise;
	}

	function check(value) {
		if (value === 1 && !threw) {
			threw = true;
			throw new Error('oops');
		}

		return value;
	}
</script>

<button onclick={() => resolvers.shift()?.()}>shift</button>
<button onclick={() => count++}>increment</button>

<svelte:boundary>
	<p>{await push(count)}</p>

	{#snippet pending()}{/snippet}

	{#snippet failed()}
		<p>failed</p>
	{/snippet}
</svelte:boundary>

{#if check(count)}
	<span>shown</span>
{/if}
