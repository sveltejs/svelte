<script>
	/**
	 * @param {Element} [node]
	 * @param {any} [options]
	 */
	const fn = (node, options) => ({});

	let a = { b: { 'c-d': fn, 'my-arr': [fn] } };

	let directive = $derived(a);
</script>

<!-- these will yield TypeScript errors, because it looks like e.g. `nested.with - string`,
     in other words a number. Relatedly, people should not do this. It is stupid. -->
<div use:directive.b.c-d></div>
<div use:directive.b.my-arr[0]></div>
{#each directive.b['my-arr'] as _, i}
	<div use:directive.b.my-arr[i]></div>
{/each}

<div transition:directive.b.c-d></div>
<div transition:directive.b.my-arr[0]></div>
{#each directive.b['my-arr'] as _, i}
	<div transition:directive.b.my-arr[i]></div>
{/each}

{#each [] as i (i)}
	<div animate:directive.b.c-d></div>
{/each}
{#each [] as i (i)}
	<div animate:directive.b.my-arr[0]></div>
{/each}
{#each directive.b['my-arr'] as _, i (i)}
	<div animate:directive.b.my-arr[i]></div>
{/each}
<div in:directive.b.c-d></div>
<div in:directive.b.my-arr[0]></div>
{#each directive.b['my-arr'] as _, i}
	<div in:directive.b.my-arr[i]></div>
{/each}

<div out:directive.b.c-d></div>
<div out:directive.b.my-arr[0]></div>
{#each directive.b['my-arr'] as _, i}
	<div out:directive.b.my-arr[i]></div>
{/each}

