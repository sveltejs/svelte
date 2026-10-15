<script>
	const variant = '[&>*]:a [&[data-x="y"]]:b a<b';
	let { active = true } = $props();
</script>

<span class="b {variant}"></span>
<span class="b [&>*]:a" class:active></span>
<svelte:element this={'span'} class="b [&>*]:a"></svelte:element>

<style>
	.b {
		color: red;
	}
</style>
