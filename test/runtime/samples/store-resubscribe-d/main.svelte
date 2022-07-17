<script>
	import { writable } from 'svelte/store';
	export let store = writable(31);
</script>

{$store}
