<script>
	import { setContext } from 'svelte';
	import ChildComponent from './ChildComponent.svelte';

	setContext('foo', true);

	const content = ChildComponent.render({}, { context: new Map() }).html;
</script>

<div>{@html content}</div>
