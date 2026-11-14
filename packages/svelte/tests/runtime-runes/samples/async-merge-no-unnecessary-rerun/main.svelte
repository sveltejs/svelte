<script>
	let a = $state(0);
	let b = $state(0);

	const queue = [];

	function push(from, v) {
		if (!v) return v;
		console.log(from + ' ' + v);
		return new Promise(r => queue.push(() => r(v)));
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<button onclick={() => queue.pop()?.()}>pop</button>

{a} + {b} = {await push('a+b', a + b)} | {await push('b', b)}
