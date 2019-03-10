<script>
	let a = 5;
	let b = 5;
</script>

<style>
	input {
		display: block;
		width: 10em
	}
</style>

<!-- number and range inputs are bound to numeric values -->
<input bind:value={a} type=number min=0 max=10>
<input bind:value={b} type=range min=0 max=10>

<p>{a} * {b} = {a * b}</p>