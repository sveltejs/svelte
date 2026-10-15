<script>
	let array = $state([1, 2]);
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
<p>{array.map((n) => n + count).join(',')} {[count, ...array].join(',')}</p>

<button
	onclick={() => {
		pending = true;
		array.map = Array.prototype.map;
		array[Symbol.iterator] = Array.prototype[Symbol.iterator];
		key = 'x';
	}}>add</button
>
<button onclick={() => count++}>increment</button>
<button onclick={() => deferred.shift()?.()}>resolve</button>
