<script>
	let value = $state();
	let show = $state(false);
	const deferred = Promise.withResolvers();

	function wait(value) {
		return value === undefined ? '' : deferred.promise;
	}
</script>

<button onclick={() => (value = { x: 1 })}>update</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => deferred.resolve('')}>resolve</button>

{await wait(value)}

<!-- read value.x twice to ensure it reads latest value not just the first time -->
<p>{show ? value.x + value.x : ''}</p>