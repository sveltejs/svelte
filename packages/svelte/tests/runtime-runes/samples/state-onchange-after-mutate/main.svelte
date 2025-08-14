<script>
	let object = $state(
		{},
		{
			onchange() {
				console.log($state.snapshot(object));
			}
		}
	);

	object.message = 'hello';
</script>

<button onclick={() => object.message = 'goodbye'}>goodbye</button>
