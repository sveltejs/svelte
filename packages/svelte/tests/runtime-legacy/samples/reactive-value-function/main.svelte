<script>
	let foo = () => 1;

	var bar = function() {
		return 2;
	}

	export function update() {
		foo = () => 3;
		bar = () => 4;
	}
</script>

{foo()}-{bar()}
