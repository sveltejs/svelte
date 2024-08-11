<script lang="ts">
	import Parent from './Parent.svelte';
	import Child from './Child.svelte';
</script>

<Parent>
	<Child slot="item" let:item onclick={() => console.log(item)}>asd</Child>
</Parent>
