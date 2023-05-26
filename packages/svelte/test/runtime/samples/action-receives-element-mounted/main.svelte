<script>
	export let result;
	function onMountAction(node) {
		result.parentElement = node.parentElement;
	}
</script>

<h1 use:onMountAction>Hello!</h1>