<svelte:element this={"div"} />
<svelte:element this={'div'} />
<svelte:element this={"div"} />

<!-- we don't try to fix this bug, we just leave it as-is -->
<svelte:element this="h{n}" />
