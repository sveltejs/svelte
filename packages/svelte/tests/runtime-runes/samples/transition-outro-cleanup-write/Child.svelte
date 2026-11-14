<script>
	import { onDestroy } from 'svelte';

	let { cleanup } = $props();

	onDestroy(cleanup);
</script>

<p>child</p>
