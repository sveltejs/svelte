<script>
	import { onMount } from 'svelte';

	let rest = $state(undefined);

	// Rerun the attribute spread after mounting, before dispatching the input event.
	onMount(() => {
		rest = {};
	});
</script>

<input {...rest} oninput={() => console.log('hi')}>
