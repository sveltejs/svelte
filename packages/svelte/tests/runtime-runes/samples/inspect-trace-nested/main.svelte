<script>
	let count = $state(0);

	$effect(() => {
		$inspect.trace('effect');
		(()=>{
			$inspect.trace("iife");
			count;
		})();
	});
</script>

<button onclick={() => count++}>{count}</button>
