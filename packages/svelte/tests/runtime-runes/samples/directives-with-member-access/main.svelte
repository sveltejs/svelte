<script>
	/**
	 * @param {Element} [node]
	 * @param {any} [options]
	 */
	const fn = (node, options) => ({});

	let a = { b: { 'c-d': fn } };

	let directive = $derived(a);
</script>

<!-- these will yield TypeScript errors, because it looks like e.g. `nested.with - string`,
     in other words a number. Relatedly, people should not do this. It is stupid. -->
<div use:directive.b.c-d />
<div transition:directive.b.c-d />
<div animate:directive.b.c-d />
<div in:directive.b.c-d />
<div out:directive.b.c-d />
