<script>
	import { onMount } from 'svelte';
	import { get_current_component } from 'svelte/internal';

	let gotException = 0;

	onMount(() => {
		try {
			get_current_component();
		} catch (error) {
			gotException++;
		}
	});
</script>

{gotException}
