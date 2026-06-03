<script>
    let pending = null;
</script>
<svelte:boundary {pending}>
    {await 'awaited'}
</svelte:boundary>