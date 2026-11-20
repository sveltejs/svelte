<script lang="ts">
	let callback: () => number;

	function install(fn: () => number) {
		callback = fn;
	}

	let reader = $derived(() => a);
	install(reader);

	let a = $derived(await Promise.resolve(42));
	// reads `a` via the function that is the value of `reader`
	let b = $derived(await Promise.resolve(callback()));
</script>

<p>{a}/{b}</p>
