<script>
	let name ;
	
	function onInput(event) {
		name = event.target.value
	}
</script>

<input value={name} on:input={onInput}>

<h1>{name}!</h1>