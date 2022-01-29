<script>
	export let promise1 = {width: 3, height: 4};
	export let promise2 = {width: 5, height: 7};
	export let constant = 10;

	function calculate(width, height, constant) {
		return { area: width * height, volume: width * height * constant };
	}
</script>

{#await promise1 then box}
	{@const {area, volume} = calculate(box.width, box.height, constant)}
	{@const perimeter = (box.width + box.height) * constant}
	{@const [width, height, sum] = [box.width * constant, box.height, box.width * constant + box.height]}
	<div>{area} {volume} {perimeter}, {width}+{height}={sum}</div>
{/await}

{#await promise2 catch box}
	{@const {area, volume} = calculate(box.width, box.height, constant)}
	{@const perimeter = (box.width + box.height) * constant}
	{@const [width, height, sum] = [box.width * constant, box.height, box.width * constant + box.height]}
	<div>{area} {volume} {perimeter}, {width}+{height}={sum}</div>
{/await}