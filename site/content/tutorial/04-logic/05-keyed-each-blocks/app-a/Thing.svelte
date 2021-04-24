<script>
	// `current` is updated whenever the prop value changes...
	export let current;

	// ...but `initial` is fixed upon initialization
	const initial = current;
</script>

<div>
	<p style="background: {initial}">initial</p>
	<p style="background: {current}">current</p>
</div>

<style>
	div:first-of-type { margin-top: 6px }
	p {
		display: inline-block;
		padding: 0.4em 1em;
		text-align: center;
		border-radius: 0.2em;
		color: #F1F5F9;
		margin: 0;
	}
	p:nth-child(odd) { margin: 0 4px 8px 0 }
</style>