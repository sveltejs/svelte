<script>
	import { log } from "./log";
</script>

<div onclick={() => log.push('outer div onclick')}>
	<div on:click={() => log.push('inner div on:click')}>
		<button onclick={() => log.push('button onclick')} on:click={() => log.push('button on:click')}>main</button>
	</div>
</div>
