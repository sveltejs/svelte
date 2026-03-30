<script lang="ts">
  const test = async () => "test";
  await test();
  $inspect("inspect after await shouldn't break builds");
</script>

works
