<script>
	let settings = {
		fontSize: 12,
		bg: 'green'
	};
	export let modify = false;
	$: if (modify) {
		settings.fontSize = 50;
	}
</script>

<p style:font-size="{settings.fontSize}px" style="background-color: {settings.bg}" />
