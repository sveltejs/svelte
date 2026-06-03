<script>
	const items = [
		{ id: 1, name: "a" },
		{ id: 2, name: "b" },
		{ id: 3, name: "c" },
		{ id: 4, name: "d" },
	];
	let currentId = $state(1);
	let currentItem = $derived(items.find(item => item.id === currentId));
	let visible = $state(true);
</script>

<main>
	{#if visible}
		<div>Current ID: {currentId}</div>
		<div>Name: {currentItem.name}</div>
		{#each items as item}
			<div><button onclick={() => { currentId = item.id; }}>{item.name}</button></div>
		{/each}
	{/if}
	<hr>
	<div><button onclick={() => { visible = !visible; }}>Show / Hide</button></div>
</main>
