<script>
	export let spread = { style: 'color: red;' };
	export let color = 'green';
	export let style = 'color: blue;';
</script>

<p
	style:color
	{style}
	{...spread}
/>
