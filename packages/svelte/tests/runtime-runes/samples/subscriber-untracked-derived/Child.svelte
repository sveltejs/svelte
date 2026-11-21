<script lang="ts">
	import { untrack } from 'svelte';
	import { createSubscriber } from 'svelte/reactivity';

	const subscribe = createSubscriber(() => {
		console.log('start');
		return () => console.log('stop');
	});
	let value = $derived.by(() => {
		subscribe();
		return 1;
	});
	untrack(() => value);
</script>
