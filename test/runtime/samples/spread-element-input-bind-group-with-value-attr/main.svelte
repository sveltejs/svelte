<script>
	export let props;
	let radioValue;
</script>

<input type="radio" value="abc" {...props} bind:group={radioValue} />
