<script>
	import { log } from './log.js';

	let method = $state('method');
	function submitPay() {
		log.push(method);
	}
	let methods = [{method:1}];
</script>
{#each methods as {method}}
	<button onclick={submitPay}>{method}</button>
{/each}
