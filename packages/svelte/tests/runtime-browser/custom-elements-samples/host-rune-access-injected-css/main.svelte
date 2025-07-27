<svelte:options css="injected" customElement="custom-element"/>

<script lang="ts">
  $effect(() => {
    $host().dispatchEvent(new CustomEvent("html", { detail: $host().shadowRoot?.innerHTML }));
  })
</script>

<button class="btn">btn</button>

<style >
  .btn {
    width: 123px;
    height: 123px;
  }
</style>