<script>
	let a = $state(0);
	let b = $state(0);
	let c = $state(0);
	const {a: a1, b: b1, c: c1} = $derived({a, b, c});

	$effect(() => {
		console.log('a', a1)
	});

	$effect(() => {
		console.log('b', b1)
	});

	$effect(() => {
		console.log('c', c1)
	});
</script>

<button onclick={() => a++}>{a1}</button>
<button onclick={() => b++}>{b1}</button>
<button onclick={() => c++}>{c1}</button>
