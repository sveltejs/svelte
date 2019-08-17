<script>
	export let myClass;
	export let attributes = {};
</script>

<div class={myClass} class:three,four={true} {...attributes}></div>
