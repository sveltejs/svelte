<script lang="ts">
	import { onDestroy } from 'svelte';

	onDestroy(() => {
		console.log('child onDestroy');
	});
</script>

<p>child</p>
