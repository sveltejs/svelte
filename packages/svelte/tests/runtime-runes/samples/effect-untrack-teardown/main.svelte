<script>
	let prop = $state();
	let key = $state({});

	function action() {
		prop = {};
		$effect.pre(() => {
			return () => {
				prop;
			}
		});
	}

	$effect(() => key = {});
</script>

{#key key}
	<div use:action>test</div>
{/key}
