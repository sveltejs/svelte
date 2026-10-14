<script>
	import { writable } from 'svelte/store';

	async function get_store() {
		return writable('hello');
	}

	const store = await get_store();

	function read() {
		return $store;
	}
</script>

<p>{$store}</p>
<p>{read()}</p>
