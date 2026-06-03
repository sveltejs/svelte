<script>
	import { fork } from 'svelte';

	let s = $state(1);
	let d = $derived(s);
</script>

<button onclick={async () => {
	const f = fork(() => {
		s = s + 1;
	});

	console.log(d);
	await f.commit();
	console.log(d);
}}>++</button>
