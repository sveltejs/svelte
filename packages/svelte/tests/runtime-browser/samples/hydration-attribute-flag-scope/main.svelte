<script>
	let { n = 1 } = $props();
	let pre = $state(1);
	let post = $state(1);

	$effect.pre(() => {
		pre = 2;
	});

	$effect(() => {
		post = 2;
	});
</script>

<div data-n={n} data-pre={pre} data-post={post}></div>
