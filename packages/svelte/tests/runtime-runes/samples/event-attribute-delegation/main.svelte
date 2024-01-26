<script>
	import { log } from './log.js';
	const action = () => {}
</script>
<div use:action onclick={() => log.push('clicked container')} onkeydown={() => {}}>
	<div use:action onclick={(e) => { log.push('clicked div 1') }}>
		<div onclick={(e) => { log.push('clicked div 2') }}>
			<button onclick={(e) => { log.push('clicked button') }}>
				Button
			</button>
		</div>
	</div>
</div>
