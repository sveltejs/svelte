<script>
	let group = [];
	
	const options = [
		["1", ["1a", "1b"]],
		["2", ["2a", "2b"]],
	];
</script>

{#each options as [prefix, arr]}
	{prefix}
	<div>
		{#each arr as item}
			<label>
				<input
					type="checkbox"
					bind:group
					value={item}
				/>
				{item}
			</label>
		{/each}
	</div>
{/each}

<p>{JSON.stringify(group)}</p>
