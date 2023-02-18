<script>
	import Sub from './sub.svelte';

	export let columns = ['a', 'b', 'c'];
	export let rows = ['1', '2', '3'];

	function onClick() {
		columns = ['a', 'c'];
		rows = ['1', '3',  '2'];
	}
</script>

<button on:click={onClick}>click</button>

<table>
	{#each rows as row (row)}
	<tr>
		{#each columns as column}
			<td>
				<Sub {row} {column} />
			</td>
		{/each}
	</tr>
	{/each}
</table>
