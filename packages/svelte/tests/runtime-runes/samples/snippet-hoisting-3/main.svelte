<script module>
	export { foo }
</script>

<script>
	let name = 'world';
</script>

<h1>Hello {name}!</h1>

{#snippet foo()}
	oo
{/snippet}
