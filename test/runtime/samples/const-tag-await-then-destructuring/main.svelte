<script>
	export let promise1 = {width: 3, height: 4};
	export let promise2 = {width: 5, height: 7};
	export let constant = 10;

	function calculate(width, height, constant) {
		return { area: width * height, volume: width * height * constant };
	}
</script>

{#await promise1 then { width, height }}
	{@const {area, volume} = calculate(width, height, constant)}
	{@const perimeter = (width + height) * constant}
	{@const [_width, _height, sum] = [width * constant, height, width * constant + height]}
	<div>{area} {volume} {perimeter}, {_width}+{_height}={sum}</div>
{/await}

{#await promise2 catch { width, height }}
	{@const {area, volume} = calculate(width, height, constant)}
	{@const perimeter = (width + height) * constant}
	{@const [_width, _height, sum] = [width * constant, height, width * constant + height]}
	<div>{area} {volume} {perimeter}, {_width}+{_height}={sum}</div>
{/await}