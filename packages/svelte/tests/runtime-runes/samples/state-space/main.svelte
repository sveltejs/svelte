<script>
	let text = $state('');

	function update_text() {
			text = 'updated';
	}
</script>

<button type="button" on:click={update_text}>Update Text</button>

<div>{text}</div>
