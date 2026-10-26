<script>
	const binding = {
		get: () => 'before action',
		set: () => {}
	};

	function initialize() {
		binding.get = () => 'after action';
	}

	let first = $state('initial');
	let second = $state('replacement');
	let current = $state.raw({ get: () => first, set: (value) => first = value });
	const noop = () => {};
</script>

<input use:initialize bind:value={binding.get, binding.set} />
<input use:noop bind:value={current.get, current.set} />
<button onclick={() => current = { get: () => second, set: (value) => second = value }}>replace</button>
<p>{second}</p>
