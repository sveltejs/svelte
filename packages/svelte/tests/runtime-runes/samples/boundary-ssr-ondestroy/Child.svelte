<script>
	import { onDestroy } from 'svelte';
	let { name, log, fail = false } = $props();
	log.push(`setup ${name}`);
	onDestroy(() => log.push(`destroy ${name}`));
	if (fail) throw new Error('boom');
</script>

<p>{name}</p>
