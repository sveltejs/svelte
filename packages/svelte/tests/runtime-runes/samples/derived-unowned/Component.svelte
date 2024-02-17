<script context="module">
	class Foo {
		x = $state(5);
		y = $derived(this.x * 2);
	}
	const foo = new Foo();

	let x = $state(2);
	let y = $derived(x * 2);
	const bar = {
		get x() {
			return x;
		},
		set x(val) {
			x = val;
		},

		get y() {
			return y;
		},
	};
</script>

<button onclick={() => foo.x++}>
	x: {foo.x}, y: {foo.y}
</button>

<button onclick={() => bar.x++}>
	x: {bar.x}, y: {bar.y}
</button>
