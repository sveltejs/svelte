<script>
	import Two from './Two.svelte';
</script>

<Two>
	<div slot="b">
		<div>
			<slot name="a"></slot>
		</div>
	</div>
</Two>