<script>
	import { SvelteDate } from 'svelte/reactivity';

	const date = new SvelteDate(0);
	const snapshot = $derived($state.snapshot(date));
</script>

<button onclick={() => date.setTime(86400000)}>update</button>
<p>{snapshot.toISOString()}</p>
