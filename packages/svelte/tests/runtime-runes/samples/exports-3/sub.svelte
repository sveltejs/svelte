<script>
	let count = $state(0);
	let doubled = $derived(count * 2);

	export { count, doubled };

	export function increment() {
		count += 1;
	}
</script>

{count}
{doubled}
