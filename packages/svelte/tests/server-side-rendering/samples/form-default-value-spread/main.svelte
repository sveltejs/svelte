<script>
	const text = { defaultValue: 'hello' };
	const box = { type: 'checkbox', defaultChecked: true };
	let reads = 0;
	let tags = 0;
	let html = 0;
	let content = '';
	function props() {
		reads += 1;
		return text;
	}
	function tag() {
		tags += 1;
		return 'textarea';
	}
</script>

<input {...text} />
<textarea {...text}></textarea>
<textarea {...{ value: 'hello' }}></textarea>
<input {...box} />
<svelte:element this="input" {...box} />
<svelte:element this="input" type="checkbox" defaultChecked />

<textarea {...text} value="override"></textarea>
<textarea value="override" {...text}></textarea>
<textarea {...text} {...{ VALUE: '' }}></textarea>
<textarea {...text} {...{ value: 0 }}></textarea>
<textarea {...text} value={null}></textarea>
<textarea {...text}>children</textarea>
<textarea {...{ defaultValue: 'default' }}>dynamic {'children'}</textarea>
<textarea defaultValue="static" {...{}}></textarea>
<textarea defaultValue="static" value="value"></textarea>
<textarea value="value" defaultValue="static"></textarea>
<textarea {...{ value: '<script>&</textarea>' }}></textarea>
<svelte:element this="input" {...text} />
<svelte:element this="input" defaultValue="static" />
<svelte:element this="input" {...text} value="" />
<svelte:element this="input" {...box} checked={false} />
<svelte:element this="input" checked={false} {...box} />
<svelte:element this="input" {...box} {...{ CHECKED: false }} />
<svelte:element this="textarea" {...text} />
<svelte:element this="textarea" defaultValue="static" />
<svelte:element this="textarea" value="value" />
<svelte:element this="textarea" {...text} value="" />
<svelte:element this="textarea" {...text}>children</svelte:element>
<svelte:element this="textarea" {...{ value: '<script>&</textarea>' }} />
{#each ['input', 'textarea'] as tag}
	<svelte:element this={tag} {...text} />
{/each}

<textarea defaultValue="&lt;hello &amp; goodbye>" {...{}}></textarea>
<svelte:element this="textarea" value="&lt;hello &amp; goodbye>" />
<svg><svelte:element this="input" {...{ defaultValue: 'svg' }} /></svg>

<textarea {...props()}></textarea>
<svelte:element this={tag()} {...props()} />
<p>{reads} {tags}</p>
<textarea value="static" {...{ value: 'spread' }}></textarea>
<textarea {...{ value: 'spread' }} value="static"></textarea>
<textarea {...text} class:active={true} style:color={'red'}></textarea>
<svelte:element this="div" contenteditable bind:innerHTML={html}>children</svelte:element>
<svelte:element this="div" contenteditable bind:textContent={content}>children</svelte:element>
