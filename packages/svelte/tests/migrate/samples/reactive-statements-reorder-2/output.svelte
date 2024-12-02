<script>
	import { run } from 'svelte/legacy';

	let width = 0;
	let mobile = $derived(width < 640);
	run(() => {
		console.log(mobile);
	});
</script>

{width / mobile}