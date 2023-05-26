<script>
	export let boxes = [
		{length: 2, width: 3, height: 4},
		{length: 9, width: 5, height: 7},
		{length: 10, width: 6, height: 8}
	];

	function calculate(length, width, height) {
		return { 
				twoDimensions: {
				bottomArea: length * width,
				sideArea1: width * height,
				sideArea2: length * height
			},
			threeDimensions: {
				volume: length * width * height
			}
		};
	}

	export let dimension = 'Dimensions';
	function changeDimension() {
		dimension = 'DIMENSIONS';
	}

	let area = 'Area';
</script>

{#each boxes as { length, width, height }}
	{@const {
		[`two${dimension}`]: { 
			i = 1, 
			[`bottom${area}`]: bottom, 
			[`side${area}${i++}`]: sideone, 
			[`side${area}${i++}`]: sidetwo 
		},
		[`three${dimension}`]: {
			volume
		}
	} = calculate(length, width, height)}
	<button on:click={changeDimension}>{bottom}, {sideone}, {sidetwo}, {volume}</button>
{/each}
