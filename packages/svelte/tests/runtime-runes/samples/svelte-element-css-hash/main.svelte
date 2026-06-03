<script>
	let { tag = "div", active = false } = $props();

	function cn(classname) {
		return classname;
	}
</script>

<svelte:element this={tag}></svelte:element>
<svelte:element this={tag} class="red"></svelte:element>
<svelte:element this={tag} class:active={active}></svelte:element>
<svelte:element this={tag} class="red" class:active={active}></svelte:element>
<svelte:element this={tag} class={cn("blue")}></svelte:element>
<svelte:element this={tag} class={cn("blue")} class:active={active}></svelte:element>

<style>
	.red {
		color: red;
	}
</style>
