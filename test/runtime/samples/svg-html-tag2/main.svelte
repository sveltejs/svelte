<script>
	export let width = 100
	export let height = 60
	$: circle = `<circle cx="${width/4}" cy="${height/2}" r="24" fill="#FFD166"/>`
</script>

<svg width="{width}" height="{height}">
	<rect>
		{@html circle}
		<circle cx="{width/4*3}" cy="{height/2}" r="24" fill="#118AB2"/>
	</rect>
</svg>
