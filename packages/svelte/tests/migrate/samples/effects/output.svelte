<script>
	import { run } from 'svelte/legacy';

	let count = 0;
	run(() => {
		console.log(count);
	});
	run(() => {
		if (count > 10) {
			alert('too high')
		}
	});
	run(() => {
		console.log('foo');
	});
</script>