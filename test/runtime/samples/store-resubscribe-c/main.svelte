<script>
	import { writable } from 'svelte/store';
	const context = {
		store1: writable(31),
		store2: writable(42)
	};
	let store1;
	let store2;
	({
		store1,
		store2
	} = context);
</script>

{$store1}
{$store2}
