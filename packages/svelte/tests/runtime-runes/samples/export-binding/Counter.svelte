<script>
	let { ...rest } = $props();
	let count = $state(0);
	export function increment() {
		count++;
	}
</script>

<!-- test that the binding isn't inside rest -->
{Object.keys(rest).length}

{count}
