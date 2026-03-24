<script>
	let a = $state(0);
	let b = $derived(await delay(a * 2));
	let c = $state(0);
	let d = $derived(await delay(b + c));

	const deferred = [];

	function delay(value) {
		if (!value) return value; 
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

a {a} | b {b} | c {c} | d {d}
<button onclick={() => {a++;}}>
	a++
</button>
<button onclick={() => {c++;}}>
	c++
</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
<button onclick={() => deferred.pop()?.()}>pop</button>