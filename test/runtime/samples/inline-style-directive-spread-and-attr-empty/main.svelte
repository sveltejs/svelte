<script>
	export let spread = { style: 'color: red;' };
	export let color = null;
	export let style = 'color: blue';
</script>

<p
	style:color
	{...spread}
	{style}
/>
