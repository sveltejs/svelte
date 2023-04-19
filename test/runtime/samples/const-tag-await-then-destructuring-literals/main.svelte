<script>
	export let promise1 = {width: 3, height: 4};
	export let promise2 = {width: 5, height: 7};
	export let constant = 10;

	function calculate(width, height, constant) {
		return { 'the-area': width * height, 'the-volume': width * height * constant };
	}
</script>

{#await promise1 then { width, height }}
	{@const {'the-area': area, 'the-volume': volume} = calculate(width, height, constant)}
	{@const perimeter = (width + height) * constant}
	{@const { 0: _width, 1: _height, 2: sum } = [width * constant, height, width * constant + height]}
	<div>{area} {volume} {perimeter}, {_width}+{_height}={sum}</div>
{/await}

{#await promise2 catch { width, height }}
	{@const {'the-area': area, 'the-volume': volume} = calculate(width, height, constant)}
	{@const perimeter = (width + height) * constant}
	{@const { 0: _width, 1: _height, 2: sum } = [width * constant, height, width * constant + height]}
	<div>{area} {volume} {perimeter}, {_width}+{_height}={sum}</div>
{/await}
