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

{#each boxes as { width, height }}
	{@const {area, volume} = calculate(width, height, constant)}
	{@const perimeter = (width + height) * constant}
	{@const [_width, ...[_height, ...[sum]]] = [width * constant, height, width * constant + height]}
	<div>{area} {volume} {perimeter}, {_width}+{_height}={sum}</div>
{/each}
