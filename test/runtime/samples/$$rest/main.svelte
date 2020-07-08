<script>
	import App from './App.svelte';
	let a = 1, b = 2, c = 3, d = 4, e = 5;
	let f = { foo: 1 };

	function updateProps() {
		a = 31;
		b = 32;
	}
	function updateRest() {
		d = 34;
	}
	function updateSpread() {
		f.foo = 31;
	}
	function updateSpread2() {
		f.bar = 2;
	}
</script>

<App {a} {b} {c} {d} {e} {...f} />
<button on:click={updateProps}></button>
<button on:click={updateRest}></button>
<button on:click={updateSpread}></button>
<button on:click={updateSpread2}></button>