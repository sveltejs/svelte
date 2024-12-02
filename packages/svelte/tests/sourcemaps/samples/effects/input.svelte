<script lang="ts">
	$effect(() => {
		foo;
	});

	$effect.pre(() => {
		bar;
	});
</script>
