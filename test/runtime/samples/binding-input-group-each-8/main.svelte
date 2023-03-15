<script>
	let keys = ["foo", "bar"];
	let values = [1, 2, 3];

	const object = {};

	$: keys.forEach((key) => {
		// Make sure Svelte has an array to bind to
		if (!object[key]) {
			object[key] = [];
		}
	});

	export function update() {
		keys = ["qux"];
		values = [4, 5, 6];
	}
</script>

<p>
	{JSON.stringify(object)}
</p>

{#each keys as key (key)}
	<h2>{key}</h2>
	<ul>
		{#each values as value (value)}
			<li>
				<label>
					<input type="checkbox" name={key} {value} bind:group={object[key]} />
					{value}
				</label>
			</li>
		{/each}
	</ul>
{/each}
