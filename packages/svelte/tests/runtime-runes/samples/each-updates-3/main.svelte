<script>
	let entries = $state([
			{
					id: 'a',
					subitems: ['a'],
			},
			{
					id: 'b',
					subitems: ['b'],
			},
			{
					id: 'c',
					subitems: ['c'],
			},
			{
					id: 'd',
					subitems: ['d'],
			},
	]);

	function onDeleteEntry(entry) {
			entries = entries.filter((innerEntry) => innerEntry.id !== entry.id);
	}
	</script>

	<ul>
			{#each entries as entry}
					<li>
							<button on:click={() => onDeleteEntry(entry)}>Delete</button>
							{entry.id}
							{#each entry.subitems as subitem}
									{subitem}
							{/each}
					</li>
			{/each}
	</ul>
