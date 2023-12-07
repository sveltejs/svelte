<script>
	const array = $state([1, 2, 3]);
	const sum = $derived(array.reduce((a, b) => a + b, 0));
</script>

<button onclick={() => array.push(array.length + 1)}>
	{array.join(' + ')} = {sum}
</button>

<button onclick={() => array.length = 1}>
	clear
</button>

<button onclick={() => array.reverse()}>
	reverse
</button>

{#each array as n}
	<span>{n}</span>
{/each}

<strong>array[1]: {array[1]}</strong>
