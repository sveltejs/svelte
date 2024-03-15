<script>
    let { bar } = $props.bindable();
</script>

<button on:click={() => bar--}>{bar}</button>