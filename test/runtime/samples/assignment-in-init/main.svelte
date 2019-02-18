<script>
	let foo;
	let bar = (foo = 1) * 2;

	export const get_foo = () => foo;
	export const get_bar = () => bar;
</script>