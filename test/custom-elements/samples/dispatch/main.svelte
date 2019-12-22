<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const handleChange = evt => {
		dispatch('change', evt);
	};
</script>

<svelte:options tag="custom-element" />
<label>
	<input type="checkbox" on:change={handleChange} />
</label>
