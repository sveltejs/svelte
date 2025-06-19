<script>
	let collapsed = false;
</script>

<div class="sidebar" class:collapsed={collapsed}>
	<div class="content">Content</div>
</div>

<style>
	.sidebar.collapsed {
		width: 60px;
	}
	
	.collapsed .content {
		opacity: 0;
	}
	
	.unused {
		color: red;
	}
</style>
