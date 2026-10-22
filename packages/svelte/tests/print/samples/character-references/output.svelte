<script lang="ts" generics="T extends { id: string }"></script>

<p>&lt;div> is not an element</p>
<p>a &#123;b} c</p>
<p>Tom & Jerry, &amp;copy; and a lone & sign</p>
<div title='say "hi"'></div>
<div title="it's &quot;both&quot;"></div>
<div title='a "quoted" {value} word'></div>
<input value="&#123;not an expression}" />
<div style:content='"x"'></div>

<svelte:head>
	<script>if (a < b && c) console.log('&amp;');</script>
	<style>p::before { content: "&lt;"; }</style>
</svelte:head>
