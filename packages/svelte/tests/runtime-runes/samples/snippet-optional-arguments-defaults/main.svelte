{#snippet one(a, b = 1, c = (2, 3))}
  {a}{b}{c}
{/snippet}

{#snippet two(a, b = (1, 2), c = 3)}
  {a}{b}{c}
{/snippet}

{@render one(0)}/{@render two(0)}
