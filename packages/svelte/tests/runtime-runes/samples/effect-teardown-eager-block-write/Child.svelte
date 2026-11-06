<script>
	import { onDestroy } from 'svelte';

	let { reset } = $props();

	onDestroy(() => reset());
</script>

<p>child</p>
