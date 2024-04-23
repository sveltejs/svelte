<script>
	let a1 = $state();
	let b1 = $state();

	$effect(() => {
		console.log('a1: ', a1);
	});

	$effect(() => {
		console.log('b1: ', b1);
	});

	a();
	queueMicrotask(a);

	b();
	queueMicrotask(b);

	function a() {
		a1 ??= true;
	}

	function b() {
		b1 ?? (b1 = true);
	}
</script>

