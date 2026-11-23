<script>
	import { store } from './store.js';

	async function get_store() {
		return store;
	}

	const s = await get_store();
</script>

<p>{$s}</p>
