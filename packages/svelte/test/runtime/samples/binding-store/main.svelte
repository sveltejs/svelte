<script>
	import { writable } from 'svelte/store';

	export const name = writable('world');
</script>

<input bind:value={$name}>
<p>hello {$name}</p>