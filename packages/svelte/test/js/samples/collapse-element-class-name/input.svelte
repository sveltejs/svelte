<script>
  import Component from "./Component.svelte";
  export let size;
  export let theme;
</script>

<div
  class="
		button
		button--size--{size}
		button--theme--{theme}
  	{$$restProps.class || ''}"
	style="
		color: green;
		background: white;
		font-size: {size};
  	transform: {$$restProps.scale}  {$$restProps.rotate};
		{$$restProps.styles}"
  other="
		button
		button--size--{size}
		button--theme--{theme}
  	{$$restProps.class || ''}" />

<Component
	class="
		button
		button--size--{size}
		button--theme--{theme}
  	{$$restProps.class || ''}"
	style="
		color: green;
		background: white;
		font-size: {size};
  	transform: {$$restProps.scale}  {$$restProps.rotate};
		{$$restProps.styles}"
  other="
		button
		button--size--{size}
		button--theme--{theme}
  	{$$restProps.class || ''}" />