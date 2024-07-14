<script>
	let action = $state('old url');
</script>

<form action={action} onsubmit={function(event) {
	console.log(this.action);
	event.preventDefault();
}}>
	<button type="submit" onclick={() => {
		action = 'new url';
	}}>Submit</button>
</form>
