<script>
	const {log = []} = $props();

	function send() {
		log.push("onclick")
	}
</script>

{undefined}<hr/>
<button onclick={send}>Send Event</button>
