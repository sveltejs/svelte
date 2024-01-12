<script>
	import { log } from './log.js';
</script>
<div on:click={(e) => { log.push('clicked div') }}>
	<button onclick={(e) => { log.push('clicked button'); e.stopPropagation() }}>
		Button
	</button>
</div>
