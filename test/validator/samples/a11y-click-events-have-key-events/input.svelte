<script>
  function noop() {}
</script>

<!-- should warn -->
<div on:click={noop} />

<!-- should not warn -->
<div on:click={noop} on:keydown={noop} />
<div on:click={noop} on:keyup={noop} />
<div on:click={noop} on:keypress={noop} />
<div on:click={noop} on:keydown={noop} on:keyup={noop} />
<div on:click={noop} on:keyup={noop} on:keypress={noop} />
<div on:click={noop} on:keypress={noop} on:keydown={noop} />
<div on:click={noop} on:keydown={noop} on:keyup={noop} on:keypress={noop}  />
