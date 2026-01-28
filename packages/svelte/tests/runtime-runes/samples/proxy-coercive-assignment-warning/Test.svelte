<script>
	let { x = $bindable() } = $props();

	$effect(() => {
		x = {};
	});

	export function soThatTestReturnsAnObject() {
		return x;
	}
</script>
