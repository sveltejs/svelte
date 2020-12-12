<script>
	// `current` is updated whenever the prop value changes...
	export let currentColor;
	export let currentId;

	// ...but `initial` is fixed upon initialisation
	const initialColor = currentColor;
	const initialId = currentId;
</script>

<p>
	<span style="background-color: {initialColor}">Initial, Thing Id: {initialId}</span>
	<span style="background-color: {currentColor}">Current, Thing Id: {currentId}</span>
</p>

<style>
	span {
		display: inline-block;
		padding: 0.2em 0.5em;
		margin: 0 0.2em 0.2em 0;
		width: 5em;
		text-align: center;
		border-radius: 0.2em;
		color: white;
	}
	p{
		margin-top: 0.1em;
		margin-bottom: 0.2em;
	}
</style>