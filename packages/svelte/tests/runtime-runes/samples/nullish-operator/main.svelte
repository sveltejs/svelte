<script>
	let a1 = $state();
	let b1 = $state();

	const {log} = $props();
	
	$effect(() => {
		log.push('a1: ', a1);
	});
	$effect(() => {
		log.push('b1: ', b1);
	});
	
	a();
	queueMicrotask(a);
	
	b();
	queueMicrotask(b);
	
	function a() {
		a1 ??= {};
	}
	
	function b() {
		b1 ?? (b1 = {});
	}
</script>

