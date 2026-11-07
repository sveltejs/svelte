<script>
	import { Spring, spring } from 'svelte/motion';

	const modern = new Spring(0);
	const legacy = spring(0);

	export function start() {
		return Promise.all([modern.set(100), legacy.set(100)]);
	}
</script>

<p>{modern.current.toFixed(3)}</p>
<p>{$legacy.toFixed(3)}</p>
