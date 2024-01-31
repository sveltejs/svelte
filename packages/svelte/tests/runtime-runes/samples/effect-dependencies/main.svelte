<script context="module">
	class Things {
		tab = $state('A');

		data = $state([{no: 1}, {no: 2}]);
		list = $derived(this.filter());

		filter() {
			this.tab;
			return this.data;
		}
	}

	const things = new Things();
</script>

<div>
		<button onclick={() => things.tab = 'A'} >A</button>
		<button onclick={() => things.tab = 'B'} >B</button>
</div>

<div>
	{#if things.tab === 'A'}
			A
	{:else}
		B
		{#each things.list as item}
			{item.no}
		{/each}
	{/if}
</div>
