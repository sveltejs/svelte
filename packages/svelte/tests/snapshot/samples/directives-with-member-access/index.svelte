<script>
	const one = ()=>{};
	const nested = {one};
	const evenmore = {nested};
</script>

<div use:one />
<div use:nested.one />
<div use:evenmore.nested.one />

<div transition:one />
<div transition:nested.one />
<div transition:evenmore.nested.one />

<div animate:one />
<div animate:nested.one />
<div animate:evenmore.nested.one />

<div in:one />
<div in:nested.one />
<div in:evenmore.nested.one />

<div out:one />
<div out:nested.one />
<div out:evenmore.nested.one />