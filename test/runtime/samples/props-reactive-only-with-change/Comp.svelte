<script>
  export let id;
  export let callback;

  $: $$props, callback(id);
</script>