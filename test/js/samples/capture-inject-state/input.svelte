<script context="module">
  export let moduleLiveBinding;
  export const moduleConstantProps = 4;
  let moduleLet;
  const moduleConst = 2;
  let shadowedByModule;
</script>
<script>
  export let prop;

  let realName;
  export { realName as alias };

  let local;

  const priv = 'priv';

  $: computed = local * 2;

  let shadowedByModule;
</script>
<!-- NOTE $prop ensures store subscriptions are not part of captured state -->
<p>{prop} {realName} {local} {priv} {$prop} {shadowedByModule}</p>
