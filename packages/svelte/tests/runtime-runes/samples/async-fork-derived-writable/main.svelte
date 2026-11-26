<script>
	import { fork } from 'svelte';

	let s = $state(1);
	let d = $derived(s * 10);
</script>

<button onclick={async () => {
	const f = fork(() => {
		// First modify s, then write to d
		// If d is evaluated in fork context, it would see s=2 and compute d=20
		// But it should evaluate in real-world context to get d=10
		s = 2;
		d = 99;
	});

	// Should be 10 (real-world value: s=1, so d=1*10=10), not 20 (fork value)
	console.log(d);
	await f.commit();
	// Should be 99 (the value we wrote)
	console.log(d);
}}>++</button>
