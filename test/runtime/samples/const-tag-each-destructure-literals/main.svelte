<script>
	export let boxes = [
		{width: 3, height: 4},
		{width: 5, height: 7},
		{width: 6, height: 8},
	];
	export let constant = 10;

	function calculate(width, height, constant) {
		return { 'the-area': width * height, 'the-volume': width * height * constant };
	}
</script>

{#each boxes as { width, height }}
	{@const { 'the-area': area, 'the-volume': volume } = calculate(width, height, constant)}
	{@const perimeter = (width + height) * constant}
	{@const { 2: sum, 0: _width, 1: _height } = [width * constant, height, width * constant + height]}
	<div>{area} {volume} {perimeter}, {_width}+{_height}={sum}</div>
{/each}
