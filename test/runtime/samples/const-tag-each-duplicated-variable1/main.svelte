<script>
	export let nums = [1, 2, 3];
	let foos = [
		{
			nums: [1, 2, 3],
		},
		{
			nums: [0, 2, 4],
		},
		{
			nums: [-100, 0, 100],
		},
	];
</script>

{#each nums as num}
	{@const bar = foos.map((foos) => foos.nums)}
	<p>bar: {bar}, num: {num}</p>
{/each}
