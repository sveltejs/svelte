<script>
	let text = "";
	const updater = (event) => {
		text = event.target.textContent;
	};
	$: spread = {
		contenteditable: text !== "a",
	};
</script>

<div {...spread} on:input={updater}>{text}</div>
