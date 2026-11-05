<script>
	import { onDestroy } from 'svelte';

	export let name;
	export let log;
	export let fail = false;
	export let value = 'bound';

	log.push(`setup ${name}`);
	onDestroy(() => log.push(`destroy ${name}`));
	if (fail) throw new Error('boom');
</script>

<p>{name}</p>
