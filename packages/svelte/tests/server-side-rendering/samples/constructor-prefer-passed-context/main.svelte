<script>
	import { setContext } from 'svelte';
	import { render } from 'svelte/server';
	import ChildComponent from './ChildComponent.svelte';

	setContext('foo', true);

	const content = render(ChildComponent, { props: {}, context: new Map() }).html;
</script>

<div>{@html content}</div>
