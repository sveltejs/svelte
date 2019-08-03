<script>
	import { writable } from 'svelte/store';
	function fake_observable(store) {
		return { subscribe: cb => ({ unsubscribe: store.subscribe(cb) }) };
	}

	let foo = fake_observable(writable(0));
	foo = fake_observable(writable(42));
</script>

{$foo}
