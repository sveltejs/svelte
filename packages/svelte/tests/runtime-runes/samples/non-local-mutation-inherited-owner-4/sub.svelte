<script>
	import { global } from "./state.svelte";
    
	// The real world use case would be someone manipulating state locally, for example form state,
	// and then push the values to a global state for everyone else to see / possibly mutate.
	const local_soon_global = $state({ b: 0 });
	global.add_a(local_soon_global);
</script>
