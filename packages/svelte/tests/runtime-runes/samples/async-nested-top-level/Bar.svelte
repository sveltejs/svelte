<script lang="ts">
	import { resolve } from './main.svelte';

	const bar = await new Promise((r) => resolve.push(() => r('bar')));
</script>

<p>bar: {bar}</p>
