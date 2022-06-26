<script>
	export let nums = [1, 2];
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
	let foo = 0;
</script>

<p>{foo}</p>
{#each nums as num, index}
	{@const bar = nums.map((num) => {
		function func(foos, num) {
			return [...foos.map((foo) => foo), num];
		}
		return func(foos[index].nums, num);
	})}
	<p>bar: {bar}, num: {num}</p>
{/each}
