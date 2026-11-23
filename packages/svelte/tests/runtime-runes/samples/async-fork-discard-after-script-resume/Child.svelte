<script lang="ts">
	let { wait, finish }: {
		wait: Promise<void>;
		finish: () => void;
	} = $props();

	await wait;

	$effect(() => {
		console.log('created');
	});

	// The real batch has already adopted this component. Discard the fork after
	// creating the effect, but before the runner's completion callbacks execute.
	finish();
</script>

<p>done</p>
