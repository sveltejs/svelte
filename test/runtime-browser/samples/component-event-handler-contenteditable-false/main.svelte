<script>
	export let text = '';
	const updater = (event) => {text = event.target.textContent}
</script>

<div contenteditable="false" on:input={updater}>{text}</div>
