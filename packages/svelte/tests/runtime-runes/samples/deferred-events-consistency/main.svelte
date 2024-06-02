<script>
	let disabled = $state(false);
</script>

<button disabled={disabled} onmouseup={() => {
	disabled = true;
}} onclick={() => {
	console.log('I should not be invoked');
}}>Click me!</button>
