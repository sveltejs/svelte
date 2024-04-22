<div>
    <script></script>
</div>
{@html `<script>document.body.innerHTML = 'this should not be executed'</script>`}
{#if true}
    <script></script>{@html `<script>document.body.innerHTML = 'this neither'</script>`}
{/if}
