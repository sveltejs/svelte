<script>
	let object = $state({});
	let count = $state(0);
	let key = $state('');
	let pending = false;

	const deferred = [];

	function delay(value) {
		if (!pending) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

<p>{await delay(key)}</p>
<p>{count} {JSON.stringify(object)}</p>

<button
	onclick={() => {
		pending = true;
		object.x = 1;
		key = 'x';
	}}>add</button
>
<button onclick={() => count++}>increment</button>
<button onclick={() => deferred.shift()?.()}>resolve</button>
