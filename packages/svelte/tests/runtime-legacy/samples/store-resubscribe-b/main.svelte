<script>
	import { writable } from 'svelte/store';
	let foo = writable(0);
	foo = writable(42);
</script>

{$foo}
