<script>
	import Foo from './Foo.svelte';

	export let thePromise;
  const pending = 'pending';
  const then = 'then';
  const the_catch = 'catch';
</script>

<Foo>
  <p slot={pending}>loading pending...</p>
  <svelte:fragment slot={then}>
	  {#await thePromise}
	  	<p>loading then...</p>
	  {:then theValue}
	  	<p>the value is {theValue}</p>
	  {/await}
  </svelte:fragment>
  <svelte:fragment slot={the_catch}>
	  {#await thePromise}
	  	<p>loading catch...</p>
	  {:catch theError}
	  	<p>oh no! {theError.message}</p>
	  {/await}
  </svelte:fragment>

</Foo>
