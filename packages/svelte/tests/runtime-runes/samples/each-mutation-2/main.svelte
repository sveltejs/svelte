<script>
	let numbers = $state([{id: 1}, {id: 2}, {id: 3}]);
</script>

<button onclick={() => numbers.push({id: numbers.length + 1})}>
	push
</button>

<button onclick={() => numbers.pop()}>
	pop
</button>

{#each numbers as number}
	<p>{number.id}</p>
{/each}
