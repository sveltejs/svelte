<script>
	let count1 = $state(0);
	let count2 = $state(0);
	let queue = [];

	function delay(v) {
		if (v === 0) return Promise.resolve(0);

		const p = Promise.withResolvers();
		queue.push(() => p.resolve(v));
		return p.promise;
	}
</script>

<button onclick={() => count1++}>count1: {count1}</button>
<button onclick={() => count2++}>count2: {count2}</button>
<button onclick={() => queue.shift()()}>resolve</button>

<p>{await delay(count1)}</p>
{#if count2 > 2}
	<p>{await delay(count1 + 'nested')}</p>
{/if}
