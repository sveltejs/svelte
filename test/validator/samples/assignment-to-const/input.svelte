<script>
	const immutable1 = false;
	const immutable2 = 0;

	// these ones should not warn
	const obj1 = { prop: true };
	const obj2 = { prop: 0 };

	function func1() {
		immutable1 = true
	}

	function func2() {
		immutable2++;
	}

	function func3() {
		obj1.prop = false;
	}

	function func4() {
		obj2.prop++;
	}
</script>

<button on:click={func1}>click</button>
<button on:click={func2}>click</button>
<button on:click={func3}>click</button>
<button on:click={func4}>click</button>

<button on:click={() => immutable2 = true}>click</button>
<button on:click={() => immutable2++}>click</button>
<button on:click={() => obj1.prop = false}>click</button>
<button on:click={() => obj2.prop++}>click</button>