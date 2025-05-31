<script>
	import { setContext } from 'svelte';

	let condition = $state(false);

	$effect(() => {
		if (condition) {
			try {
				setContext('potato', {});
			} catch (e) {
				console.log(e.message);
			}
		}
	});
</script>

<button onclick={() => condition = !condition}>
	{condition}
</button>
