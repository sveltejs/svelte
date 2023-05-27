<script>
	export let promise1 = {length: 5, width: 3, height: 4};
	export let promise2 = {length: 12, width: 5, height: 13};
	export let permutation = [1, 2, 3];

	function calculate(length, width, height) {
		return { 
			'1-Dimensions': [length, width, height],
			'2-Dimensions': [length * width, width * height, length * height],
			'3-Dimensions': [length * width * height, length + width + height, length * width + width * height + length * height]
		};
	}
</script>

{#await promise1 then { length, width, height }}
	{@const [a, b, c] = permutation}
	{@const { [`${a}-Dimensions`]: { [c - 1]: first }, [`${b}-Dimensions`]: { [b - 1]: second }, [`${c}-Dimensions`]: { [a - 1]: third } } = calculate(length, width, height) }
	<p>{first}, {second}, {third}</p>
{/await}

{#await promise2 catch { length, width, height }}
	{@const [a, b, c] = permutation}
	{@const { [`${a}-Dimensions`]: { [c - 1]: first }, [`${b}-Dimensions`]: { [b - 1]: second }, [`${c}-Dimensions`]: { [a - 1]: third } } = calculate(length, width, height) } 
	<p>{first}, {second}, {third}</p>
{/await}
