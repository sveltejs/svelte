<script>
	function transitionOut(node) {
		return () => {
			return {
				duration: 100,
				tick: t => {
					node.transitioned = t;
				}
			};
		};
	}
</script>

<div out:transitionOut|global></div>
