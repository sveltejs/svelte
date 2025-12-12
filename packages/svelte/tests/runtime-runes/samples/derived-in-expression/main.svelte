<script>
	let object = $state.raw({ a: 0, b: 0 });

	function a() {
		console.log('a');
		return object.a;
	}

	function b() {
		console.log('b');
		let double = $derived(object.b)
		return double;
	}

	$effect(() => {
		object.a;
		console.log('effect a');
	})

	$effect(() => {
		const b = $derived(object.b);
		b;
		console.log('effect b');
	})
</script>

<button onclick={() => object = { ...object, a: object.a + 1 }}>a</button>
<button onclick={() => object = { ...object, b: object.b + 1 }}>b</button>

<p>{a()}/{b()}</p>
