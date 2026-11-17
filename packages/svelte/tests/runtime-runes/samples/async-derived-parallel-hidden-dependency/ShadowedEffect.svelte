<script lang="ts">
	let callback: () => number;

	// not the `$effect` rune, so the callback runs (and is stored) right away
	function install($effect: (fn: () => number) => void) {
		$effect(() => a);
	}

	install((fn) => (callback = fn));

	let a = $derived(await Promise.resolve(42));
	// reads `a` via the stored callback
	let b = $derived(await Promise.resolve(callback()));
</script>

<p>{a}/{b}</p>
