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
	let default_nums = [-1];
	let foo = "dummy-foo";
	let num = "dummy-num";
</script>

<p>foo: {foo}, num: {num}</p>
{#each nums as num}
	{@const bar = foos.map((foo) =>
		foo.nums.filter((num) => {
      if (Object.keys($$slots).length) {
        return false;
			} else if (Object.keys(foo).length) {
				return nums.includes(num) || default_nums.includes(num);
			} else {
				return false;
			}
		}) || num
	)}
	<p>bar: {bar}, num: {num}</p>
{/each}
