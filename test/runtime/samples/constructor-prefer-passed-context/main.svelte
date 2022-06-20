<script>
	import { setContext } from 'svelte';
	import ChildComponent from './ChildComponent.svelte';

	setContext('foo', true);

	function render(node) {
		new ChildComponent({
			target: node,
			context: new Map()
		});
	}
</script>

<div use:render />
