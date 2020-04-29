<script>
	import Child from './Child.svelte'

	export let myClass;
	export let attributes = {};
</script>

<Child class={myClass} class:three={true} {...attributes}></Child>
