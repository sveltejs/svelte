<script>
	const one = ()=>{};
	const nested = {one, "with-string": one};
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

<div use:nested.with-string />
<div use:evenmore.nested.with-string />

<div transition:nested.with-string />
<div transition:evenmore.nested.with-string />

<div animate:nested.with-string />
<div animate:evenmore.nested.with-string />

<div in:nested.with-string />
<div in:evenmore.nested.with-string />

<div out:nested.with-string />
<div out:evenmore.nested.with-string />