<script lang="ts">
  const test = async () => "test";
  await test();
  $inspect("inspect after await shouldnt break builds");
</script>

works
