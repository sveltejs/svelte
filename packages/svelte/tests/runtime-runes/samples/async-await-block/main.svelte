<script>
    let foo = $derived(await 1);
</script>

{#await foo then x}
    <p>{x}</p>
{/await}
