<!-- an action or sth else could dynamically set the data-state -->
<div class="foo"></div>
<style>
	.foo:global([data-state='checked']) {
		background-color: red;
	}
</style>