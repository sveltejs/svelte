<script>
	let bg = "red";

	const handle = () => {
			bg = undefined;
	};
</script>

<div style:background={bg} on:click={handle}></div>
