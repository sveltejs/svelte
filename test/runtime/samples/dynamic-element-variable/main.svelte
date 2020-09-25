<script>
  export let tag = "di";
  export let text = "Foo";
</script>

<svelte:element tag={tag + "v"}>{text}</svelte:element>