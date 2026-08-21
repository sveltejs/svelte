<script>
	let value = $state('hello');
	let elements = {};
</script>

{#if value}
	<span bind:this={elements[value.toUpperCase()]}>{value}</span>
{/if}

<button onclick={() => (value = undefined)}>clear</button>
