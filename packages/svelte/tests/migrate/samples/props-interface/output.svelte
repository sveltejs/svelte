<script lang="ts">
	

	interface Props {
		/** foo */
		foo: string;
		bar: boolean;
	}

	let { foo = $bindable(), bar = true }: Props = $props();

	foo = '';
</script>