<script>
	let { a, b, c, sum, f } = $props();
	let slow = $derived(await f('slow', c));
</script>

<p>{await f('p', a)}|{sum}</p>
{#key c}
	<em>{slow}|{await f('key', b)}</em>
{/key}
