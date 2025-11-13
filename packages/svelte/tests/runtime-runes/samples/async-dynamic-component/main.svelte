<script>
	import Component from './Component.svelte'
	const X = $derived(await Promise.resolve(Component))
	const Y = await Promise.resolve(Component)
</script>

<X />
<svelte:component this={X} />
<Y />
<svelte:component this={Y} />
