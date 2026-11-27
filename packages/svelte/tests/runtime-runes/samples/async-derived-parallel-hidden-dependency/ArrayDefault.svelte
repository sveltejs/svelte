<script lang="ts">
	const [get = () => a]: Array<() => number> = [];

	let a = $derived(await Promise.resolve(42));
	// reads `a` via the destructuring default
	let b = $derived(await Promise.resolve(get()));
</script>

<p>{a}/{b}</p>
