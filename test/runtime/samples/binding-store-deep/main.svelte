<script>
	import { writable } from 'svelte/store';

	export const user = writable({ name: 'world' });
</script>

<input bind:value={$user.name}>
<p>hello {$user.name}</p>