<script>
    function noop() {}
</script>

<!-- should warn -->
<div on:mouseover={noop} />
<div on:mouseout={noop} />
<div on:mouseover={noop} on:blur={noop} />
<div on:mouseout={noop} on:focus={noop} />

<!-- should not warn -->
<div on:mouseover={noop} on:focus={noop} />
<div on:mouseout={noop} on:blur={noop} />
<div on:mouseover={noop} on:mouseout={noop} on:blur={noop} on:focus={noop}/>