<script>
	export let propTag;
	const static_tag = 'input';
	const func_tag = () => 'br';
</script>

<h1></h1>
<svelte:element this="{'h2'}"></svelte:element>
<svelte:element this="h3"></svelte:element>
<svelte:element this="{propTag}"></svelte:element>
<svelte:element this="{static_tag}"></svelte:element>
<svelte:element this="{func_tag()}"></svelte:element>
