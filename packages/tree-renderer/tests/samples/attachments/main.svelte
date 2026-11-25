<script lang="ts">
	let view: unknown;

	export function get_view() {
		return view;
	}
</script>

<view
	{@attach (node) => {
		view = node;
	}}
/>
