<script>
	import { writable } from 'svelte/store';
	import Child from './Child.svelte';

	let actions = $state({ text: (node) => (node.textContent = 'state') });
	const store = writable({ text: (node) => (node.textContent = 'store') });

	export function reset() {
		actions = {};
	}
</script>

<div use:actions?.text></div>
<div use:actions.missing?.text></div>
<div use:$store?.text></div>
<Child actions={{ text: (node) => (node.textContent = 'prop') }} />
