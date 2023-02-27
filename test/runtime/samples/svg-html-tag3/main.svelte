<script>
	export let width = 100
	export let height = 60
	$: circle = `<circle cx="${width/4}" cy="${height/2}" r="24" fill="#FFD166"/>`
</script>

<svg>
	<foreignObject>
		{@html circle}
	</foreignObject>
</svg>
