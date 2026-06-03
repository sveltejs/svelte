<script>
	import { run } from 'svelte/legacy';

	let something = '123';
	
	let foo = $state(false);
	run(() => {
		foo = !!something;
	});
</script>