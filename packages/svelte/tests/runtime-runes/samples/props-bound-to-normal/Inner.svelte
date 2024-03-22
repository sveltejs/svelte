<script>
    let { bar = $bindable() } = $props();
</script>

<button on:click={() => bar--}>{bar}</button>