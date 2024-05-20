<script>
	import JSONNode from 'svelte-json-tree';

	/** @type {any} */
	export let data;

	/** @type {any} */
	export let columns;

	const INDEX_KEY = '(index)';
	const VALUE_KEY = 'Value';

	$: keys = Object.keys(data);
	$: columns_to_render = columns || get_columns_to_render(data, keys);

	/**
	 * @param {any} data
	 * @param {string[]} keys
	 */
	function get_columns_to_render(data, keys) {
		const columns = new Set([INDEX_KEY]);
		for (const key of keys) {
			const value = data[key];
			if (typeof value === 'object') {
				Object.keys(value).forEach((key) => columns.add(key));
			} else {
				columns.add(VALUE_KEY);
			}
		}

		return [...columns];
	}
</script>

<div class="table">
	<table>
		<thead>
			<tr>
				{#each columns_to_render as column}
					<th>{column}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each keys as key}
				<tr>
					{#each columns_to_render as column}
						{#if column === INDEX_KEY}
							<td>{key}</td>
						{:else if column === VALUE_KEY}
							<td><JSONNode value={data[key]} /></td>
						{:else if column in data[key]}
							<td><JSONNode value={data[key][column]} /></td>
						{:else}
							<td></td>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table {
		margin: 8px;
		overflow: auto;
		max-height: 200px;
	}
	table {
		font-size: 12px;
		font-family: var(--sk-font-mono);
		border-collapse: collapse;
		line-height: 1;
		border: 1px solid #aaa;
	}
	th {
		background: #f3f3f3;
		padding: 4px 8px;
		border: 1px solid #aaa;
		position: sticky;
		top: 0;
	}
	td {
		padding: 2px 8px;
	}
	tr:nth-child(2n) {
		background: #f2f7fd;
	}
	th,
	td {
		border-right: 1px solid #aaa;
	}
</style>
