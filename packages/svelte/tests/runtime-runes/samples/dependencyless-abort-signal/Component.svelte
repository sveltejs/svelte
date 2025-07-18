<script>
	import { getAbortSignal } from 'svelte';

	$effect(() => {
		const signal = getAbortSignal()
		signal.addEventListener('abort', () => console.log('abort'))
	})
</script>