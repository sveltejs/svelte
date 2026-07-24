<script>
	import { writable } from 'svelte/store';

	async function get_store() {
		return writable('hello');
	}

	const store = await get_store();
</script>

<p>{$store}</p>
