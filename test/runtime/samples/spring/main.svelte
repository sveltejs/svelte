<script>
	import { spring } from 'svelte/motion';

	const x = spring(0);
	x.set(1);
</script>

<p>{$x}</p>