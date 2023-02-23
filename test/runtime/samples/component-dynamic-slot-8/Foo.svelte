<script>
  export let value;
</script>

<div>
  <slot name="child" {value}>fallback {value * 2}</slot>
  {#if $$slots.alert}
    <hr>
    <slot name="alert" />
  {/if}
</div>
