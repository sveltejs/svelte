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
<div use:directive.b.c-d></div>
<div transition:directive.b.c-d></div>
{#each [] as i (i)}
	<div animate:directive.b.c-d></div>
{/each}
<div in:directive.b.c-d></div>
<div out:directive.b.c-d></div>
