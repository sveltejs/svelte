<script>
	await 1;
	let a = $state(1);
	let b = $derived(a);
</script>

{#if true}
	<!-- should only block on a, not b -->
	<p>{a}</p>
{/if}
