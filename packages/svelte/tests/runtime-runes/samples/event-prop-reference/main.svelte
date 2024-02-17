<script>
	import { log } from './log.js';

	let { item } = $props();

	function onclick() {
		log.push(item?.name);
	}
</script>

<button {onclick}>
	{item?.name}
</button>
