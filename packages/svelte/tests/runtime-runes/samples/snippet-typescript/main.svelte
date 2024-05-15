<script lang="ts">
</script>

{#snippet counter1(c: number)}
	{c}
{/snippet}
{#snippet counter2({ c }: {c: number})}
	{c}
{/snippet}
{#snippet counter3(c?: number)}
	{c}
{/snippet}
{#snippet counter4(c: number = 4)}
	{c}
{/snippet}
{#snippet counter5(c?: number = 5)}
	{c}
{/snippet}
{#snippet counter6(c?: number, d?: string)}
	{c}{d}
{/snippet}

{@render counter1(1)}
{@render counter2({ c: 2 })}
{@render counter3(3)}
{@render counter4()}
{@render counter5()}
{@render counter6(6, 'a')}
