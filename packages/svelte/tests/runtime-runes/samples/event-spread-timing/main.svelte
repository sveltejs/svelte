<script>
	const focus = (input) => {
		input.focus();
	};
</script>

<input {...({})} onfocus={() => console.log("onfocus")} use:focus />
