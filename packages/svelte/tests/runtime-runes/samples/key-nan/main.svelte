<script>
	let x = $state(NaN);
</script>

<button onclick={() => x = NaN}>update</button>

{#key x}
	{console.log('rendering')}
	<p>it rendered</p>
{/key}
