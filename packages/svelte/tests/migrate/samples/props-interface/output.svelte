<script lang="ts">
	

	interface Props {
		/** foo */
		foo: string;
		bar: boolean;
		/** should not create a prop */
		type_only: boolean;
	}

	let { foo = $bindable(), bar = true }: Props = $props();

	foo = '';
</script>