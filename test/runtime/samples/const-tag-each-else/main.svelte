<script>
	export let boxes = [
		{width: 3, height: 4},
		{width: 5, height: 7},
		{width: 6, height: 8},
	];
	export let constant = 10;

	function calculate(width, height, constant) {
		return { area: width * height, volume: width * height * constant };
	}
</script>

{#each boxes as box}
	{@const {area, volume} = calculate(box.width, box.height, constant)}
	{@const perimeter = (box.width + box.height) * constant}
	{@const [width, height, sum] = [box.width * constant, box.height, box.width * constant + box.height]}
	<div>{area} {volume} {perimeter}, {width}+{height}={sum}</div>
{:else}
	{@const double = constant + constant}
	<div>{constant} * 2 = {double}</div>
{/each}