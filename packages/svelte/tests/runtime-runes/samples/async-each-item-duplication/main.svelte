<script>
	import Component from './Component.svelte'

	const messages = await Promise.resolve(["item 1", "item 2", "item 3"])
	const another = { test: 'test' }
</script>

{#each messages as message}
	<Component {message} {another} />
{/each}
