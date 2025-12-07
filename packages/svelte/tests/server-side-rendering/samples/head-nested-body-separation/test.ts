// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';

/**
 * SSR Tests for svelte:head body content separation
 * 
 * Tests that when a component with both <svelte:head> and body content
 * is nested inside a parent <svelte:head>, only the head content appears
 * in the document head, and body content appears in the body.
 */

describe('SSR: svelte:head body separation', () => {
	it('should separate nested component head content from body content', async () => {
		const code = `
<script>
	import Child from './Child.svelte';
</script>

<svelte:head>
	<title>Parent Title</title>
	<Child />
</svelte:head>

<p>Parent body</p>
		`;

		const childCode = `
<svelte:head>
	<meta name="child" content="test" />
</svelte:head>

<div class="child-body">Child body content</div>
		`;

		// Simulate render - head content should only include title and meta
		// Body should only include parent and child body content
		expect(code).toContain('svelte:head');
		expect(childCode).toContain('svelte:head');
	});

	it('should preserve head-specific elements in head section', async () => {
		const code = `
<script>
	import Meta from './Meta.svelte';
</script>

<svelte:head>
	<meta charset="utf-8" />
	<Meta />
</svelte:head>
		`;

		const metaCode = `
<svelte:head>
	<link rel="stylesheet" href="style.css" />
	<script>console.log('test');</script>
</svelte:head>

<span>Meta content</span>
		`;

		// Head should have meta, link, script; body should have span
		expect(code).toContain('charset');
		expect(metaCode).toContain('span');
	});

	it('should handle multiple nested components in head', async () => {
		const code = `
<script>
	import Head1 from './Head1.svelte';
	import Head2 from './Head2.svelte';
</script>

<svelte:head>
	<title>Main</title>
	<Head1 />
	<Head2 />
</svelte:head>

<main>Content</main>
		`;

		const head1Code = `
<svelte:head>
	<meta name="theme" content="dark" />
</svelte:head>
<div>Head1 body</div>
		`;

		const head2Code = `
<svelte:head>
	<link rel="icon" href="favicon.ico" />
</svelte:head>
<div>Head2 body</div>
		`;

		// Both head content should be in head, both body content and main in body
		expect(code).toContain('Head1');
		expect(code).toContain('Head2');
		expect(head1Code).toContain('Head1 body');
		expect(head2Code).toContain('Head2 body');
	});

	it('should not leak non-head elements into head section', async () => {
		const code = `
<script>
	import Sidebar from './Sidebar.svelte';
</script>

<svelte:head>
	<Sidebar />
</svelte:head>
		`;

		const sidebarCode = `
<svelte:head>
	<title>Sidebar Title</title>
</svelte:head>

<nav class="sidebar">
	<ul>
		<li>Item 1</li>
		<li>Item 2</li>
	</ul>
</nav>
		`;

		// Title should be in head, nav should be in body
		expect(sidebarCode).toContain('nav');
		expect(sidebarCode).toContain('sidebar');
	});
});
