<script>
	const immutable = false;

	const obj1 = { prop: true };
	const obj2 = { prop: 0 };

	function shouldNotError() {
		obj1.prop = false;
	}

	function shouldNotError2() {
		obj2.prop++;
	}

	function shouldError() {
		immutable = true
	}

	
</script>

<button on:click={shouldNotError}>click</button>
<button on:click={shouldNotError2}>click</button>
<button on:click={shouldError}>click</button>
