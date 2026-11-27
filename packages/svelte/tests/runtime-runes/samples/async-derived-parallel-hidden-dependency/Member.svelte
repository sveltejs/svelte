<script lang="ts">
	const fns: { get?: () => number } = {};
	fns.get = () => a;

	let a = $derived(await Promise.resolve(42));
	// reads `a` via the function assigned to `fns.get`
	let b = $derived(await Promise.resolve(fns.get()));
</script>

<p>{a}/{b}</p>
