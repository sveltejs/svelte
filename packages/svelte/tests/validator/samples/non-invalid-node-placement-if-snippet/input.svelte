<table>
	<tbody>
		<tr>
			{#snippet cell(v)}Value: {v}{/snippet}
			{#each [1, 2, 3] as v}
				<td>{@render cell(v)}</td>
			{/each}
		</tr>
	</tbody>
</table>