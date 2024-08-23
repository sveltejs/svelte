<script>
	const x = `</noscript><script>console.log('should not run')<` + `/script>`
</script>

<noscript>
	<a href={x}>test</a>
</noscript>

