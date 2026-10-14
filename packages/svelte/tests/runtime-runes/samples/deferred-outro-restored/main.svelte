<script>
	import { crossfade } from 'svelte/transition';

	let visible = $state(true);
	let restore = $state(false);
	const [send] = crossfade({});

	$effect(() => {
		if (restore) visible = true;
	});
</script>

<button
	onclick={() => {
		visible = false;
		restore = true;
	}}
>
	Reproduce
</button>

{#if visible}
	<p out:send={{ key: 'item' }}>Deferred outro</p>
{/if}
