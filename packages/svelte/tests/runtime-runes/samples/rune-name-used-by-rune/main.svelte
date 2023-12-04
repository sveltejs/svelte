<script>
	import { derived } from 'svelte/store';

	let state = $state('state');
	let derived_state = $derived(state + '2');
</script>

<h1>Hello {state} {derived_state}</h1>
