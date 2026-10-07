<script lang="ts">
	import { hydratable } from 'svelte';

	const value = hydratable('child', () => 'browser');
</script>

{value}
