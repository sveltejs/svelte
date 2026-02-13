<svelte:boundary>
    {@const x = await 'this should work'}
    <div>{x}</div>
</svelte:boundary>