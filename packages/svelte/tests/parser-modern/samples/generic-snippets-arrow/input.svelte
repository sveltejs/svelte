<script lang="ts">
</script>

{#snippet foo<T extends () => void, U = Array<string>>(x: T, y: U)}
	{x}
{/snippet}
