<script>
  import Child from './Child.svelte'
	export let myClass;
</script>

<Child class={myClass} class:three={true}></Child>
