<script>
	const foo = 'hello';
	
	function shouldNotError() {
		let foo = 0;
		
		function inner() {
			foo = 1;
		}
	}
	
	function shouldError() {
		function inner() {
			foo = 1;
		}
	}
</script>

<button on:click={shouldNotError}>click</button>
<button on:click={shouldError}>click</button>