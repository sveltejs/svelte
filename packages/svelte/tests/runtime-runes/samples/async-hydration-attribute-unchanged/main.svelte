<script>
	let { n, m } = $props();

	/** @param {any} value */
	async function get(value) {
		return value;
	}
</script>

{#if await get(true)}
	<div data-n={n} data-m={m}></div>
{/if}

<p data-deferred={await get(n)}></p>
