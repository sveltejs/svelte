<script lang="ts">
	let visible = $state(true);
	let restore = $state(false);
	let log = $state<string[]>([]);

	function instant() {
		return { duration: 0 };
	}

	$effect(() => {
		if (restore) visible = true;
	});
</script>

<button
	onclick={() => {
		visible = false;
		restore = true;
	}}
>remove and restore</button>

{#if visible}
	<p
		out:instant
		onoutrostart={() => log.push('out-only start')}
		onoutroend={() => log.push('out-only end')}
	>out-only</p>
{/if}
{#if visible}
	<p
		transition:instant
		onoutrostart={() => log.push('outro start')}
		onoutroend={() => log.push('outro end')}
		onintrostart={() => log.push('intro start')}
		onintroend={() => log.push('intro end')}
	>bidirectional</p>
{/if}

<output>{log.join(', ')}</output>
