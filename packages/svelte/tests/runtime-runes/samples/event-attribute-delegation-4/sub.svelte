<script>
	import { log } from "./log";
</script>

<svelte:window onclick={() => log.push('window sub')} />
<svelte:document onclick={() => log.push('document sub')} />

<button onclick={() => log.push('button sub')}>sub</button>
