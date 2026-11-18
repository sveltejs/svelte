<script>
	import { fork } from 'svelte';

	let s = $state(1);
	let d = $derived(s * 2);
	let f;
</script>

<button onclick={() => (d = 100)}>assign</button>
<button onclick={() => (f = fork(() => (s = 5)))}>fork</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => console.log('d ' + d)}>log</button>

<p>{d}</p>
