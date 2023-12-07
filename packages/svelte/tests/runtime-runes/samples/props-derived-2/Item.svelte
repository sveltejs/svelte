<script>
	import { log } from './log.js';

	const {active} = $props();
	$effect.pre(() => {
		log.push('active changed', active)
	});
</script>

<p>Item is {active ? 'active' : 'inactive'}</p>
