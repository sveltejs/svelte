<script>
	import { run as run_1 } from 'svelte/legacy';

	let count = 0;
	let run = true;
	run_1(() => {
		console.log(count);
	});
	run_1(() => {
		if (count > 10 && run) {
			alert('too high')
		}
	});
	run_1(() => {
		console.log('foo');
		if (x) return;
		console.log('bar');
	});
	run_1(() => {
		$count = 1;
	});
</script>