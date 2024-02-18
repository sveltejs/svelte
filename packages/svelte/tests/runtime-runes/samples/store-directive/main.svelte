<script>
	import { writable } from 'svelte/store';

	let action = writable((node, text) => {
		node.textContent = text;
	});

	let text = writable('mounted')
</script>

<div use:$action={$text}>hello</div>
