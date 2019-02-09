<script>
	export let foo, bar;

	function click() {
		foo = 4; bar = 2;
	}
</script>

<button on:click={click}>click me</button>

<p>foo: {foo}</p>
<p>bar: {bar}</p>