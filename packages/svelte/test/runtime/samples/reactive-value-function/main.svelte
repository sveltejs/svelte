<script>
	let foo = () => 1;

	function bar() {
		return 2;
	}

	export function update() {
		foo = () => 3;
		bar = () => 4;
	}
</script>

{foo()}-{bar()}
