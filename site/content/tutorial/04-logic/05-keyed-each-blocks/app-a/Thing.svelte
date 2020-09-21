<script>
	// `current` is updated whenever the prop value changes...
	export let current;

	// ...but `initial` is fixed upon initialisation
	const initial = current;
</script>

<p>initial: {initial}, current: {current}</p>

<style>
	p {
		background-color: #ededed;
		padding: 0.5em 0;
		margin: 1em 0;
		text-align: center;
		border-radius: 0.2em;
	}
</style>