<script>
	let offset = $state(1);

	function* count(offset) {
		let i = offset;
		while (true) yield i++;
	}

	let [a, b, c] = $derived(count(offset));
</script>

<button onclick={() => offset += 1}>increment</button>

<p>a: {a}</p>
<p>b: {b}</p>
<p>c: {c}</p>
