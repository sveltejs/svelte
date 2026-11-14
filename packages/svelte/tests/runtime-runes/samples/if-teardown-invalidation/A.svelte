<script>
	import { registry } from './registry.svelte.js';
	$effect(() => {
		registry.current = { name: 'A' };
		return () => {
			registry.current = null;
		};
	});
</script>

<p>A (registered)</p>
