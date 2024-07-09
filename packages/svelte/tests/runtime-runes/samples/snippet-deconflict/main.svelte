<script>
	let numbers = $state([1, 2, 3]);
</script>

<button onclick={() => numbers.push(numbers.length + 1)}>
	push
</button>

<div style="display: grid; grid-template-columns: 1fr 1fr">
	<div>
		{#snippet x(n)}
			<p style="color: red">{n}</p>
		{/snippet}

		{#each numbers as n}
			{@render x(n)}
		{/each}
	</div>

	<div>
		{#snippet x(n)}
			<p style="color: blue">{n}</p>
		{/snippet}

		{#each numbers as n}
			{@render x(n)}
		{/each}
	</div>
</div>
