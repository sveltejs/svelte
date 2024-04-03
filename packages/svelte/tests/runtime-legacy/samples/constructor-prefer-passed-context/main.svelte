<script>
	import { setContext, mount } from 'svelte';
	import ChildComponent from './ChildComponent.svelte';

	setContext('foo', true);

	function render(node) {
		mount(ChildComponent, {
			target: node,
			context: new Map()
		});
	}
</script>

<div use:render />
