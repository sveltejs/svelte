<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function sayHello() {
		dispatch('message', {
			text: 'Bonjour !',
		});
	}
</script>

<button on:click={sayHello}> Cliquez pour dire bonjour </button>
