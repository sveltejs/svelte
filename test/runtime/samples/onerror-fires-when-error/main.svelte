<script>
	import { onError } from 'svelte';
	let error;
	onError(err => {
		error = err;
	});
	function getWidget() {
		throw new Error('Oops');
	}
</script>

{#if error}
<div class='error'>{error.message}</div>
{:else}
<div class='success'>{getWidget()}</div>
{/if}
