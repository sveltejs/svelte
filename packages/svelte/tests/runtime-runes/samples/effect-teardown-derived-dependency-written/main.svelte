<script>
	let a = $state(0);
	let b = $derived(a * a);
	let c = $derived(b * b);

	let x = $state(0);

	$effect(() => {
		void x;

		return () => {
			console.log({ a, b, c });
			a += 1;
			console.log({ a, b, c });
		};
	});
</script>

<button onclick={() => (x += 1)}>x</button>
