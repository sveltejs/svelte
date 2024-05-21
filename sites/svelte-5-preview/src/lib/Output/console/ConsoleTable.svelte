<script>
	import JSONNode from 'svelte-json-tree';

	/** @type {any} */
	export let data;

	/** @type {any} */
	export let columns;

	$: table = create_table(data, columns);

	/**
	 * @param {any} data
	 * @param {string[]} [custom_columns]
	 */
	function create_table(data, custom_columns) {
		let has_non_object = false;
		const columns = new Set();

		if (custom_columns) {
			custom_columns.forEach((column) => columns.add(column));
		} else {
			for (const key in data) {
				const value = data[key];
				if (typeof value === 'object') {
					Object.keys(value).forEach((key) => columns.add(key));
				} else {
					has_non_object = true;
				}
			}
		}

		const is_array = Array.isArray(data);

		const rows = Object.keys(data).map((key) => {
			const value = data[key];
			const values = [];

			for (const column of columns) {
				values.push(typeof value === 'object' && column in value ? value[column] : '');
			}

			if (has_non_object) {
				values.push(typeof value !== 'object' ? value : '');
			}

			return {
				key: is_array ? parseInt(key) : key,
				values
			};
		});

		if (has_non_object) {
			columns.add('Value');
		}

		return { columns, rows };
	}
</script>

<div class="table">
	<table>
		<thead>
			<tr>
				<th>(index)</th>

				{#each table.columns as column}
					<th>{column}</th>
				{/each}
			</tr>
		</thead>

		<tbody>
			{#each table.rows as row}
				<tr>
					<td>
						{#if typeof row.key === 'string'}
							{row.key}
						{:else}
							<JSONNode value={row.key} />
						{/if}
					</td>

					{#each row.values as value}
						<td>
							{#if typeof value === 'string'}
								{value}
							{:else}
								<JSONNode {value} />
							{/if}
						</td>
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
