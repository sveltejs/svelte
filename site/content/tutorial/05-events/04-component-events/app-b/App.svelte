<script>
	import Inner from './Inner.svelte';

	function handleMessage(event) {
		alert(event.target.text);
	}
</script>

<Inner on:message={handleMessage}/>
