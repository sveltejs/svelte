<script module>
	export { foo }
</script>

<script>
	let x = 42;
</script>

{#snippet foo()}
	{x}
{/snippet}
