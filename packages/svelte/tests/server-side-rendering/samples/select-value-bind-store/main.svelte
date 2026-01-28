<script>
	import { writable } from 'svelte/store';
	const value = writable('dog');
</script>

<select bind:value={$value}>
	<option value="">--Please choose an option--</option>
	<option value="dog">Dog</option>
	<option value="cat">Cat</option>
</select>