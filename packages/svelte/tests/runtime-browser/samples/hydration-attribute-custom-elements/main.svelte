<script>
	let { n = -1 } = $props();

	const early = { is: 'svelte-early-button', 'data-on': true };
	const late = { is: 'svelte-late-button', 'data-on': true };

	// only the client sees this flag, so the `{#if}` doesn't match the server markup
	const mismatch = !!globalThis.svelte_test_client;
</script>

<button {...early} tabindex={n}>early</button>
<button {...late} tabindex={n}>late</button>
{#if mismatch}
	<button {...early} tabindex={n}>recovered</button>
{/if}
