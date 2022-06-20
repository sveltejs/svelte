<script>
	export let foo = {};
	export let bar;
	$: if (bar) {
		foo[bar] = true;
	}
</script>
