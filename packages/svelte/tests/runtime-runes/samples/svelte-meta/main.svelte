<script>
	let condition = $state(false);
</script>

<button onclick={() => condition = !condition}>toggle</button>

<p>before</p>

{#if condition}
	<strong>during</strong>
{/if}

<p>after</p>
