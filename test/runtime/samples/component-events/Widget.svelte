<script>
	import { onDestroy, createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	onDestroy(() => {
		dispatch('destroy');
	});
</script>

<p>i am a widget</p>