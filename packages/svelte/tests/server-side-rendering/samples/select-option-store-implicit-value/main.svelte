<script>
	import { writable } from 'svelte/store';

	const value = writable('dog');
	const label = writable('Dog');
</script>

<select bind:value={$value}>
	<option>{$label}</option>
	<option>cat</option>
</select>
