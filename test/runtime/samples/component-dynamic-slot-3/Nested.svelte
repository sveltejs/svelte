<script>
  export let value;
</script>

<div id={value}>
  value: {value}
  <hr />
  <slot name="folder">
    <span>fallback folder</span>
  </slot>
  <hr />
  <slot name="file">
    <span>fallback file</span>
  </slot>
</div>

