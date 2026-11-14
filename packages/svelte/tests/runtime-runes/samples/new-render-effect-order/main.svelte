<script>
	let message = $state('hello');

	function log(value, label) {
		console.log(label, value);
		return value;
	}
</script>

<input bind:value={message} />

{#if true}
	<p>{log(message, 'a')}</p>
{/if}

{#if message.length > 6}
	<p>{log(message, 'b')}</p>
{/if}

{#if true}
	<p>{log(message, 'c')}</p>
{/if}
