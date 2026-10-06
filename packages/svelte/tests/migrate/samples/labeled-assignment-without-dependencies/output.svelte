<script>
	import { run } from 'svelte/legacy';

	let count = $state(7);
	
	let other = $state(8);
	
	let obj = $state({});
	run(() => {
		obj.x = 1;
	});
</script>

<p>{count} {other} {obj.x}</p>