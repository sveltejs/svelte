<script>
	import { log } from './log.js';

	function send() {
		log.push("onclick")
	}
</script>

{undefined}<hr/>
<button onclick={send}>Send Event</button>
