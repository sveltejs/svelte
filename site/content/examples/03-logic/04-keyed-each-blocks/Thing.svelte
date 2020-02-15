<script>
	// `current` is updated whenever the prop value changes...
	export let current;

	// ...but `initial` is fixed upon initialisation
	const initial = current;
</script>

<p>
	<span style="background-color: {initial}">initial</span>
	<span style="background-color: {current}">current</span>
</p>

<style>
	span {
		display: inline-block;
		padding: 0.2em 0.5em;
		margin: 0 0.2em 0.2em 0;
		width: 4em;
		text-align: center;
		border-radius: 0.2em;
		color: white;
	}
</style>