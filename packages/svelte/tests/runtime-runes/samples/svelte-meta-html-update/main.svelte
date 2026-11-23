<script lang="ts">
	let content = $state('<b>one</b>');
</script>

<button onclick={() => (content = '<b>two</b>')}>update</button>

<output>
	{#if true}
		{@html content}
	{/if}
</output>
