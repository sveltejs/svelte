<script>
	import { log } from "./log";
</script>

<div onclickcapture={() => log.push('div onclickcapture')}>
	<button onclick={() => log.push('button onclick')}>main</button>
</div>
