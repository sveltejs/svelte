<script>

    function onClick() {
        $$dispatch('clicked', 'info')
    }
</script>
<button on:click={onClick} />
