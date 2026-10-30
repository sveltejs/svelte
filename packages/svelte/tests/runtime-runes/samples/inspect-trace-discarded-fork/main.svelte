<script>
	import { fork } from 'svelte';

	const object = $state({ x: 1 });
	let show = $state(false);

	$effect(() => {
		$inspect.trace();
		if (show) object.x;
	});
</script>

<p>{show ? object.x : ''}</p>

<button onclick={() => fork(() => delete object.x).discard()}>discard</button>
<button onclick={() => (show = true)}>show</button>
