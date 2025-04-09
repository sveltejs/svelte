<script>
	import { onMount } from 'svelte'

	let thing = $state(0)

	onMount(() => {
		thing = 1;
		return () => {
			console.log(thing);
		}
	})
</script>
