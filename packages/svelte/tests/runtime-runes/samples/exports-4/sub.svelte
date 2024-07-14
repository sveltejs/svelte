<script>
	let count = $state(0);
	let doubled = $derived(count * 2);

	export { count, doubled };
</script>

{count}
{doubled}
