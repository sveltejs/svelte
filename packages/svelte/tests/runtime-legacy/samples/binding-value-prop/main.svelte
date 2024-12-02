<script>
	import Field from './Field.svelte';
	import { writable } from 'svelte/store';

	const value = writable('aaa');

</script>

<Field bind:value={$value} /> {$value}
