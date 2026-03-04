{#snippet foo()}
    {@const x = await 'this should work'}
    <div>{x}</div>
{/snippet}

{@render foo()}
