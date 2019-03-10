<script>
	import { onDestroy } from 'svelte';

	let seconds = 0;
</script>

<p>
	The page has been open for
	{seconds} {seconds === 1 ? 'second' : 'seconds'}
</p>