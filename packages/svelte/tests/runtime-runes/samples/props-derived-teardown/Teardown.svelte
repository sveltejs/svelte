<script>
	import { onDestroy } from 'svelte'
	
	const { callback } = $props()
	
	onDestroy(() => {
		callback()
	})
</script>

<div>teardown</div>