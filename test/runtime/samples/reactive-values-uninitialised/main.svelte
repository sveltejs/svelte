<script>
	export let a = 'a';
	let b;
	$: c = a;

	function foo() {
		b = c === 'a' ? 'b' : 'c';
	}
	foo();
</script>

<p>{a}{b}{c}</p>
