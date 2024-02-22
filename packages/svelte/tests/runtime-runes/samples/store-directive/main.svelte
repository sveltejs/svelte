<script>
	import { writable } from 'svelte/store';

	let store = writable({action: (node, text) => {
		node.textContent = text;
		return {
			destroy() {}
		}
	}});

	let text = writable('mounted');
</script>

<div use:$store.action={$text}>hello</div>
