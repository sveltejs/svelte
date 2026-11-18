<script>
	import { fork } from 'svelte';

	let s = $state(1);
	let d = $derived(s * 2);
	let f;

	function probe(v) {
		console.log('probe ' + v);
		return v;
	}
</script>

<button onclick={() => (f = fork(() => (s = 5)))}>fork</button>
<button onclick={() => (d = 100)}>assign</button>
<button onclick={() => f.commit()}>commit</button>

<p>{await probe(d)}</p>
