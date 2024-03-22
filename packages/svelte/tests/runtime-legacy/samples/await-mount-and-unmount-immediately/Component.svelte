<script>
	import { onMount } from 'svelte';

	export let logs;
	export let state;

	onMount(() => {
		logs.push(`mount ${state}`);
		return () => {
			logs.push(`unmount ${state}`);
		};
	});
</script>

{state}
