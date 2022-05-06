<script>
	export let propTag;
	const static_tag = 'input';
	const func_tag = () => 'br';
</script>

<h1></h1>
<svelte:element this="{'col'}"></svelte:element>
<svelte:element this="img"></svelte:element>
<svelte:element this="{propTag}"></svelte:element>
<svelte:element this="{static_tag}"></svelte:element>
<svelte:element this="{func_tag()}"></svelte:element>
