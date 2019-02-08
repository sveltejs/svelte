<script>
	export let numbers = [ 1, 2, 3 ];

	const square = num => num * num;
</script>

<p>{numbers.map(square)}</p>
