<script>
	import { fork } from 'svelte';

	let open = $state(true);
	let other = $state(0);
	let pending;
	let error = $state('');
</script>

<button onclick={() => { pending ??= fork(() => { open = true; }); }}>preload</button>
<button onclick={() => other++}>other</button>
<button onclick={() => { pending.commit().catch((e) => (error = e.message)); pending = null; }}>commit</button>

<p>{open} {other} {error}</p>
