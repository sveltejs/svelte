<script>
	let a = $state(0);
	let b = $state(0);
	let deferreds = [];

	function push(value) {
		if (!value) return value;
		const deferred = Promise.withResolvers();
		deferreds.push({ deferred, value });
		return deferred.promise;
	}
</script>

<button onclick={() => {a++;b++}}>a_b {a}_{b}</button>
<button onclick={() => (b++)}>b {b}</button>
<button onclick={() => (deferreds.shift()?.())}>resolve</button>
{await push(a)}
