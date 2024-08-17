<script context="module">
	let foo = 0;

	export function update() {
		foo += 1;
	}
</script>

<script>
	$: bar = foo;
</script>
