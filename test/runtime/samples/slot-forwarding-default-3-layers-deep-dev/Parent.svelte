<script>
	import Child from './Child.svelte';
</script>

<Child>
	<slot>Default here is applied</slot>
	<slot name="first" slot="third" />
	<slot name="second" slot="fourth"/>
</Child>
