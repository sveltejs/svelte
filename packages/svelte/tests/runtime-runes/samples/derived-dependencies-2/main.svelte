<script>
	let a = $state(true);
	let b = $state({ c: true });

	const x = $derived(b);
</script>

<button onclick={() => (a = !a)}>toggle a</button>
<button onclick={() => (b = b ? null : { c: true })}>toggle b</button>

{#if x}
	{a}/{x.c}/{x.c}
{/if}
