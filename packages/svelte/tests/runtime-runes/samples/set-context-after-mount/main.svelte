<script>
	import { setContext } from 'svelte';

	let condition = $state(false);

	$effect(() => {
		if (condition) {
			try {
				setContext('potato', {});
				console.log('works without experimental async but really shouldnt')
			} catch (e) {
				console.log(e.message);
			}
		}
	});
</script>

<button onclick={() => condition = !condition}>
	{condition}
</button>
