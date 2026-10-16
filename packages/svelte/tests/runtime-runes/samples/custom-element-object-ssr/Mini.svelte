<svelte:options customElement={{ tag: 'x-mini-ssr', props: { config: { type: 'Object' }, items: { type: 'Array' } } }} />

<script>
	let { config = { title: 'default' }, items = [] } = $props();
</script>

<p>{config.title}: {items.join(', ')}</p>
