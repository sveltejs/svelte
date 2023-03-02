<script>
	let name = 'bar';
	function foo() {
		name = 'foo';
	}
	function bar() {
		name = 'bar';
	}
	
</script>

<button on:click={name === 'bar' ? foo : bar}>{name}</button>