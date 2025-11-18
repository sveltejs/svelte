<script lang="ts">
	let items = $state([4, 5, 6]);
</script>

<button onclick={() => {
	items = items.map((n) => n - 1);
}}>
	step back
</button>

<button onclick={() => {
	items = items.map((n) => n + 1);
}}>
	step forward
</button>

<button onclick={() => {
	items = items.map((n) => n - 5);
}}>
	jump back
</button>

<button onclick={() => {
	items = items.map((n) => n + 5);
}}>
	jump forward
</button>

<div>
	{#each items as item (item)}
		<p>{item}</p>
	{/each}
</div>
