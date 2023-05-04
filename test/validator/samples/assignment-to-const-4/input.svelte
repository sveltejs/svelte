<script>
	const foo = 'hello';
</script>

<button on:click={() => {
	let foo = 0;
		
	function inner() {
		foo = 1;
	}
}}>
	click
</button>

<button on:click={() => {
	function inner() {
		foo = 1;
	}
}}>
	click
</button>