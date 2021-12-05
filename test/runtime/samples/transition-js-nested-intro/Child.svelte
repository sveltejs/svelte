<script>
	function foo(node, params) {
		return {
			delay: 50,
			duration: 100,
			tick: t => {
				node.foo = t;
			}
		};
	}
</script>

<div transition:foo><slot></slot></div>