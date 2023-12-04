<script>
	export let things;
	export let soDoesThis;
</script>

{#each things as thing}
	<span>this only exists...</span>
	<span>...to increase test coverage</span>
{/each}

{#each things as thing}{soDoesThis}{/each}

{#each things as thing}
	andThis
{/each}