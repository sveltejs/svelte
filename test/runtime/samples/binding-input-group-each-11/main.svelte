<script>
	export let pipelineOperations = [
		{
			operation: {
				name: "foo",
				args: [],
			},
			id: 1,
		},
		{
			operation: {
				name: "bar",
				args: [
					{
						name: "bar_1",
						value: "a",
						options: [{ value: "a" }, { value: "b" }],
					},
					{
						name: "bar_2",
						value: "c",
						options: [{ value: "c" }, { value: "d" }],
					},
				],
			},
			id: 2,
		},
		{
			operation: {
				name: "baz",
				args: [
					{
						name: "baz_1",
						value: "b",
						options: [{ value: "a" }, { value: "b" }],
					},
					{
						name: "baz_2",
						value: "c",
						options: [{ value: "c" }, { value: "d" }],
					},
				],
			},
			id: 3,
		},
	];
</script>

{#each pipelineOperations as { operation, id } (id)}
	<div>
		{id}
		{#each operation.args as arg}
			<div class="arg">
				{#each arg.options as { value }}
					<input type="radio" bind:group={arg.value} {value} />
				{/each}
			</div>
		{/each}
	</div>
{/each}
