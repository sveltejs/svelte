<script lang="ts" generics="T extends { id: string }"></script>

<p>&lt;div&gt; is not an element</p>
<p>a &#123;b&#125; c</p>
<p>Tom &amp; Jerry, &amp;copy; and a lone & sign</p>

<div title='say "hi"'></div>
<div title="it's &quot;both&quot;"></div>
<div title="a &quot;quoted&quot; {value} word"></div>
<input value="&#123;not an expression&#125;" />
<div style:content='"x"'></div>

<svelte:head>
	<script>if (a < b && c) console.log('&amp;');</script>
	<style>p::before { content: "&lt;"; }</style>
</svelte:head>
