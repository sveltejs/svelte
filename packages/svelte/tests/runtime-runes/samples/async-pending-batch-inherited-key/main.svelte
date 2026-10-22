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
<p>{count} {Object.hasOwn(object, 'toString')} {Object.keys(object)}</p>

<button
	onclick={() => {
		pending = true;
		object.toString = () => 'own';
		key = 'x';
	}}>add</button
>
<button onclick={() => count++}>increment</button>
<button onclick={() => deferred.shift()?.()}>resolve</button>
