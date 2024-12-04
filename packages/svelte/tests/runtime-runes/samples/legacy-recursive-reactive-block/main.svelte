<script>
	import { run } from 'svelte/legacy';

	let count = $state(0);

	run(() => {
		count = count+1;
	});
</script>

{count}