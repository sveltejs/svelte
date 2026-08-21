<script>
	let a = $state(0);
	let b = $state(0);
	let c = $state(0);
	let d = $state(0);

	const deferred = [];

	function delay(value) {
		if (!value) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

a {await delay(a)} | b {await delay(b)} | c {c} | d {d}
<button onclick={() => {a++;b++;}}>
	a and b
</button>
<button onclick={() => {a++;c++;}}>
	a and c
</button>
<button onclick={() => {b++;d++;}}>
	b and d
</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
<button onclick={() => deferred.pop()?.()}>pop</button>
