<script>
	import { writable } from 'svelte/store';
	const store = writable();

	function foo() {
		let store = 1;
		$store = 2;
	}
</script>
