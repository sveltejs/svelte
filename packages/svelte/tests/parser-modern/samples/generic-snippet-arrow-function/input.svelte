<script lang="ts">
</script>

{#snippet generic<T extends () => void>(val: T)}
	{val}
{/snippet}

{#snippet generic<T extends Array<() => void>>(val: T)}
	{val}
{/snippet}
