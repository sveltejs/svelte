<script>
	const queue1 = [];
	const queue2 = [];

	let a = $state(0);
	let b = $state(0);
	let c = $state(0);
	let d = $state(0)

	function push(value, where = 1) {
		if (!value) return value;
		return new Promise(r => (where === 1 ? queue1 : queue2).push(() => r(value)));
	}
</script>

<button onclick={() => {a++;c++}}>a / c</button>
<button onclick={() => {b+=2;d++}}>b / d</button>
<button onclick={() => queue1.pop()?.()}>pop 1</button>
<button onclick={() => queue2.shift()?.()}>shift 2</button>

<p>{a} + {b} = {await push(a + b)} | {await push(c, 2)} {await push(d, 2)}</p>
