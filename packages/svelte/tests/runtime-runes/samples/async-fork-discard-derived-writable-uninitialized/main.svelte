<script>
	import { fork } from 'svelte';

	let s = $state(1);
	let d = $derived(s * 10);
</script>

<button
	onclick={() => {
		const f = fork(() => {
			// d has not been read yet, so this write happens with an uninitialized old value
			s = 2;
			d = 99;
		});

		f.discard();
		console.log(d);
	}}
>
	test
</button>
