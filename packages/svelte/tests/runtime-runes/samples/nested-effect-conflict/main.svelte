<script>
	import { log } from './log.js';
	let c = $state({ a: 0 });

	$effect(() => {
		log.push('top level')
			$effect(() => {
					if (c) {
							$effect(() => {
								log.push('inner',c.a);
									return () => log.push('destroy inner', c?.a);
							});
					}
					return () => log.push('destroy outer', c?.a);
			})
	});
</script>

<button onclick={() => {
	c.a = 1; c = null
}}>toggle</button>
