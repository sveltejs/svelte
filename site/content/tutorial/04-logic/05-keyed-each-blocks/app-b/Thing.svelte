<script>
	// `value` is updated whenever the prop value changes...
	export let value;

	// ...but `valueAtStart` is fixed upon initialisation
	const valueAtStart = value;
</script>

{#if valueAtStart === value}
	<p>
		{valueAtStart} / {value}
	</p>
{:else}
	<p>
		{valueAtStart} / {value} => <i>bye bye last element...!</i>
	</p>
{/if}
