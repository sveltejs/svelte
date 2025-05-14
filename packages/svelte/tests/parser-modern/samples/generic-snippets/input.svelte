<script lang="ts">
</script>

{#snippet generic<T extends string>(val: T)}
	{val}
{/snippet}

{#snippet complex_generic<T extends { bracket: "<" } | "<" | Set<"<>">>(val: T)}
	{val}
{/snippet}