<script>
	export let tag = 'div';
	export let empty_tag = 'div';
	export let void_tag = 'input';
	export let custom_tag = 'connection-probe';
</script>

<svelte:element this={tag} id="parent"><connection-probe id="child"></connection-probe></svelte:element>
<svelte:element this={empty_tag} id="empty" />
<svelte:element this={void_tag} id="void" />
<svelte:element this={custom_tag} id="custom" />
