<script>
  export let a;
  export function b() {}
  export let c = 1;

  $: length = Object.keys($$rest).length;
  $: values = Object.values($$rest);
</script>
<div>Length: {length}</div>
<div>Values: {values.join(',')}</div>

<div {...$$rest} />
<div {...$$props} />