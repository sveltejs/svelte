<script>
	export let props;
	let radioValue;
</script>

<input type="radio" {...props} bind:group={radioValue} />
