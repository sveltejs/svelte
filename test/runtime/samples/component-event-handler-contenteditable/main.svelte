<script>
	let text = '';
	const updater = (event) => {text = event.target.textContent}
</script>

<div contenteditable on:input={updater}>{text}</div>
