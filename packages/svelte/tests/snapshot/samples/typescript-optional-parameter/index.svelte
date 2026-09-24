<script lang="ts">
	// the `?` on the optional parameter must be stripped, but optional chaining
	// (`x?.length`, `o?.b`) must be preserved
	function a(x?: string) {
		return x?.length;
	}

	const o: { b?: { c: number } } = {};
	const v = o?.b?.c;

	a();
</script>

{v}
