<script>
	// `value` is updated whenever the prop value changes...
	export let value;

	// ...but `valueAtStart` is fixed upon initialisation
	const valueAtStart = value;
</script>

<p>{valueAtStart} / {value}</p>