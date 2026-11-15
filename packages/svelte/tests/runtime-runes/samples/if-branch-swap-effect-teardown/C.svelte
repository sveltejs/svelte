<script lang="ts">
	import { registry } from './registry.svelte.js';

	$effect(() => {
		registry.current!.name;
	});
</script>

<p>C sees {registry.current?.name}</p>
