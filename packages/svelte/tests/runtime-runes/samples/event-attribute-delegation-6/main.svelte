<script>
	let method = $state('method');
	function submitPay() {
		console.log(method);
	}
	let methods = [{method:1}];
</script>
{#each methods as {method}}
	<button onclick={submitPay}>{method}</button>
{/each}
