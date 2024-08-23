<script>
	import { writable } from 'svelte/store';

	const count = writable(0);

	$count += 1;
	$count += 1;
	$count += 1;
</script>

<p>{$count}</p>
