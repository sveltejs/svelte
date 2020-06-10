<script>
	const immutable = false;

	const obj1 = { prop: true };
	const obj2 = { prop: 0 };

	function funcShouldNotError() {
		obj1.prop = false;
	}

	function funcShouldNotError2() {
		obj2.prop++;
	}

	function funcShouldError() {
		immutable = true
	}

	
</script>

<button on:click={funcShouldNotError}>click</button>
<button on:click={funcShouldNotError2}>click</button>
<button on:click={funcShouldError}>click</button>
