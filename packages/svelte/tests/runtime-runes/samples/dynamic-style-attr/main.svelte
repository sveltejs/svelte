<script>
	let color = $state('red');

	const getColor = () => color;
</script>

<div style="background-color: {getColor()}">Hello world</div>

<button onclick={() => color = 'blue'}>Make blue</button>
