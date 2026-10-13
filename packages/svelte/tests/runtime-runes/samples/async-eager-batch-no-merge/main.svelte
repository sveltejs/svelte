<script>
	let page = $state(1);
	let filter = $state('a');

	const deferred = [];

	function load(page, filter) {
		const value = `${page}/${filter}`;
		if (value === '1/a') return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

<button onclick={() => page++}>page</button>
<button onclick={() => (filter = 'b')}>filter</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
<button onclick={() => deferred.pop()?.()}>pop</button>

<p>page: {page}</p>
<p>result: {await load(page, $state.eager(filter))}</p>
