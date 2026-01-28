<script>
	let data = [
		[0, 0],
		[0, 4],
		[1, 4],
	];

	function add() {
		const n = [0, 0]
		data.push(n);
		data = data;
	}
</script>

<button onclick={add}>add</button>

<ul>
		{#each data as d (d.join(""))}
			<li> {d}</li>
		{/each}
</ul>
