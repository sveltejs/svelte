<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let logs;

	function click() {
		try {
			dispatch('click');
		} catch (error) {
			logs.push(error);
		}
	}
</script>
<button on:click={click} />