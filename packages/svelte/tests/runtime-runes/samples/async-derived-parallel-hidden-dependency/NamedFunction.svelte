<script lang="ts">
	const registry: { read?: (return_self: boolean) => any } = {};

	const read = function self(return_self: boolean): any {
		return return_self ? self : a;
	};

	registry.read = read(true);

	let a = $derived(await Promise.resolve(42));
	// reads `a` via the function, which passed itself on via its own name
	let b = $derived(await Promise.resolve(registry.read(false)));
</script>

<p>{a}/{b}</p>
