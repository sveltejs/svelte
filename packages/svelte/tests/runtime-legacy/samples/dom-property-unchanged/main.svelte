<script>
	let items = ['a', 'b'];
	let initial = 'a';
	let count = 0;
</script>

<button onclick={() => (initial = initial === 'a' ? 'b' : null)}>change initial</button>

{#each items as item (item)}
	<details open={item === initial} ontoggle={() => count++}>
		<summary>{item}</summary>
		<p>{count}</p>
	</details>
{/each}
