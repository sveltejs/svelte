<script>
	let a = $state(0);
	let b = $derived(a * a);

	let x = $state(0);

	$effect(() => {
		void x;

		return () => {
			console.log({ a, b });
			a = 5;
			console.log({ a, b });
		};
	});
</script>

<button onclick={() => { a += 1; x += 1; }}>go</button>

<p>{b}</p>
