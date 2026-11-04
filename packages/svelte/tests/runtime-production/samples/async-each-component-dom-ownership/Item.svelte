<script>
	let { title, children } = $props();
</script>

<div class="row">
	<span>{title}</span>
	{@render children()}
</div>
