<script>
  export let prop;

  let realName;
  export { realName as alias };

  let local;

  const priv = 'priv';
</script>
<!-- NOTE $prop ensures store subscriptions are not part of captured state -->
<p>{$prop} {realName} {local} {priv}</p>
