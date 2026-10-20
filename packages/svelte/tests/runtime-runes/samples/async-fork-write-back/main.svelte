<script>
	import { fork } from 'svelte';

	let source = $state(0);
	let writable = $derived(source);
	let pending;
</script>

<button onclick={() => {
	pending = fork(() => {
		source = 1;
		source = 0;
		writable = 1;
		writable = 0;
	});
}}>fork</button>

<button onclick={() => pending.commit()}>commit</button>

<p>{source}:{writable}</p>
