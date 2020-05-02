<script>
  import Child from './Child.svelte'
  import Component from './Component.svelte'

  let value = 'a';
</script>

<button on:click={e => value = 'b'}>Click me</button>
<Child>
  <p>Value: {value}</p>
  <Component prop="foo" />
</Child>
