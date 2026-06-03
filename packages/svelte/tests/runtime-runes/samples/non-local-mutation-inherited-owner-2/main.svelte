<script lang="ts">
	import Sub from './sub.svelte';
	import { create_my_state } from './state.svelte';

	const myState = create_my_state();
</script>

<Sub count={myState.my_state} inc={myState.inc} />
