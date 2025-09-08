# Svelte Async SSR Hydration: Resolved Content Without Pending Snippets (Simplified Design)

This document outlines the implementation plan for hydrating boundaries when async SSR has already resolved the content on the server and no `pending` snippet exists. This uses a simplified approach that reuses existing hydration infrastructure and allows client-side async re-execution.

## Problem Statement

With async SSR, we now have boundaries that can render in two states:

**Boundary with pending snippet:**

```svelte
<svelte:boundary>
	<p>{await getData()}</p>
	{#snippet pending()}
		<p>Loading...</p>
	{/snippet}
</svelte:boundary>
```

- **With pending snippet**: Server always renders `<p>Loading...</p>`
- **Without pending snippet**: Server waits for `getData()`, renders `<p>Resolved Data</p>`

**The hydration challenge**: How does the client know which content the server rendered?

## Simplified Design Approach

### Core Principles

1. **No promise value serialization** - Client async operations can re-execute if needed
2. **Reuse existing markers** - Leverage the `else` block marker pattern (`<!--[!-->`)
3. **Binary state model** - Either "pending rendered" or "resolved rendered"
4. **Allow async re-execution** - If promises don't resolve immediately on client, let them run

### Existing Infrastructure to Reuse

Svelte already has a pattern for this with `{#if}` blocks:

```html
<!-- If condition was true on server -->
<!--[-->
<div>if content</div>
<!--]-->

<!-- If condition was false on server (else rendered) -->
<!--[!-->
<div>else content</div>
<!--]-->
```

We can apply the same pattern to boundaries, where pending is the "else" case:

```html
<!-- Server rendered resolved content (normal case) -->
<!--[-->
<p>Resolved content</p>
<!--]-->

<!-- Server rendered pending content (else case) -->
<!--[!-->
<p>Loading...</p>
<!--]-->
```

## Implementation Plan

### Phase 1: Server-Side Changes

#### 1.1 Server Boundary Rendering Logic

Modify `SvelteBoundary` server visitor to use existing marker pattern:

```javascript
export function SvelteBoundary(node, context) {
	const pending_snippet = node.metadata.pending;

	if (pending_snippet) {
		// Has pending snippet - render pending content with else marker
		context.state.template.push(b.literal(BLOCK_OPEN_ELSE)); // <!--[!-->

		if (pending_snippet.type === 'Attribute') {
			const value = build_attribute_value(pending_snippet.value, context, false, true);
			context.state.template.push(b.call(value, b.id('$$payload')));
		} else if (pending_snippet.type === 'SnippetBlock') {
			context.state.template.push(context.visit(pending_snippet.body));
		}
	} else {
		// No pending snippet - render main content (may be async or sync)
		context.state.template.push(b.literal(BLOCK_OPEN)); // <!--[-->
		context.state.template.push(context.visit(node.fragment));
	}

	context.state.template.push(b.literal(BLOCK_CLOSE)); // <!--]-->
}
```

**Key insight**: The server only cares about whether there's a pending snippet. If there is, render it with the else marker. If not, render the main content with the normal marker - the server will naturally wait for any async operations to resolve during rendering.

### Phase 2: Client-Side Hydration Changes

#### 2.1 Hydration State Detection

Extend boundary constructor to detect server rendering state:

```javascript
constructor(node, props, children) {
	this.#anchor = node;
	this.#props = props;
	this.#children = children;
	this.#hydrate_open = hydrate_node;

	// NEW: Detect what the server rendered
	this.#server_rendered_pending = this.#detect_server_state();

	this.parent = active_effect.b;
	this.pending = !!this.#props.pending;

	// Main effect logic...
}

#detect_server_state() {
	if (!hydrating || !this.#hydrate_open) return false;

	const comment = this.#hydrate_open;
	if (comment.nodeType === COMMENT_NODE) {
		// Check if server rendered pending content (else marker)
		return comment.data === HYDRATION_START_ELSE; // '[!'
	}

	return false;
}
```

#### 2.2 Hydration Flow Logic

Modify the main boundary effect to handle both cases:

```javascript
this.#effect = block(() => {
	active_effect.b = this;

	if (hydrating) {
		hydrate_next();

		if (this.#server_rendered_pending) {
			// Server rendered pending content - existing logic
			this.#hydrate_pending_content();
		} else {
			// Server rendered resolved content - new logic
			this.#hydrate_resolved_content();
		}
	} else {
		// Client-side rendering
		this.#render_client_content();
	}
}, flags);
```

#### 2.3 Resolved Content Hydration

Implement the resolved content hydration path:

```javascript
#hydrate_resolved_content() {
  // Server already rendered resolved content, so hydrate it directly
  this.#main_effect = this.#run(() => {
    return branch(() => this.#children(this.#anchor));
  });

  // Start in non-pending state since server rendered resolved content
  this.pending = false;

  // Note: Even if client-side async operations are still running,
  // we never transition back to pending state. Users can use
  // $effect.pending() to track ongoing async work if needed.
}

#hydrate_pending_content() {
	// Existing logic - server rendered pending content
	this.#pending_effect = branch(() => this.#props.pending(this.#anchor));

	Batch.enqueue(() => {
		this.#main_effect = this.#run(() => {
			Batch.ensure();
			return branch(() => this.#children(this.#anchor));
		});

		if (this.#pending_count > 0) {
			this.#show_pending_snippet();
		} else {
			pause_effect(this.#pending_effect, () => {
				this.#pending_effect = null;
			});
			this.pending = false;
		}
	});
}
```

### Phase 4: Compiler Integration

#### 4.1 Analysis Phase

The analysis already tracks `is_async` on boundaries. We just need to ensure it's set correctly:

```javascript
// In AwaitExpression visitor - this already exists
if (context.state.async_hoist_boundary && context.state.expression) {
	context.state.async_hoist_boundary.metadata.is_async = true;
	// ... existing logic
}
```

#### 4.2 Server Code Generation

The server visitor change is minimal - just use the else marker for pending content:

```javascript
// In server SvelteBoundary visitor
export function SvelteBoundary(node, context) {
	const pending_snippet = node.metadata.pending;

	if (pending_snippet) {
		// Use else marker for pending content
		context.state.template.push(b.literal(BLOCK_OPEN_ELSE));
		// ... render pending content
	} else {
		// Use normal marker for main content (async or sync)
		context.state.template.push(b.literal(BLOCK_OPEN));
		// ... render main content
	}

	context.state.template.push(b.literal(BLOCK_CLOSE));
}
```

## Edge Cases and Considerations

### Edge Case 1: Multiple Async Operations with Different Timing

```svelte
<svelte:boundary>
	<p>{await fast()}</p>
	<p>{await slow()}</p>
</svelte:boundary>
```

If `fast()` resolves on server but `slow()` doesn't, the server still waits for both before rendering resolved content. On client, both may re-execute with different timing.

**Handling**: The boundary's `#pending_count` system already handles multiple async operations correctly.

### Edge Case 2: Conditional Async Content

```svelte
<svelte:boundary>
	{#if condition}
		<p>{await getData()}</p>
	{:else}
		<p>No data needed</p>
	{/if}
</svelte:boundary>
```

**Handling**: The `is_async` flag is set if any path contains async operations. Server-side rendering will resolve the condition and any async operations in the taken path.

### Edge Case 3: Nested Boundaries

```svelte
<svelte:boundary>
	<div>{await outer()}</div>
	<svelte:boundary><div>{await inner()}</div></svelte:boundary>
</svelte:boundary>
```

**Handling**: Each boundary is independent. Inner boundary can be resolved while outer is pending, or vice versa.

## Implementation Context

### Key Design Philosophy

- This is the **simplified** approach - we deliberately chose NOT to serialize promise values
- We're reusing existing `if/else` block hydration markers rather than creating new ones
- The server doesn't need to know about `is_async` - it just renders based on pending snippet presence

### Critical Semantic Understanding

- `<!--[!-->` = pending content (the "else" case when async hasn't resolved)
- `<!--[-->` = resolved content (normal case)
- This inversion makes semantic sense: pending is the fallback/else state

### Boundary State Rules

- Boundaries **never** transition back to pending once content is rendered
- Use `$effect.pending()` for tracking ongoing async work, not boundary state
- The `pending` property stays `false` once content is shown

### Server Logic Simplicity

- Server only checks: "Does this boundary have a pending snippet?"
- If yes → render pending with `BLOCK_OPEN_ELSE`
- If no → render main content with `BLOCK_OPEN` (async SSR waits naturally)

### Client Hydration Flow

- Detect marker type to know what server rendered
- If `HYDRATION_START_ELSE` → server rendered pending, use existing logic
- If normal marker → server rendered resolved, hydrate directly (no complex async handling)

### What We're NOT Doing

- No promise serialization/deserialization
- No complex client-server async coordination
- No `error` snippet handling (server never renders errors)
- No distinction between async/sync resolved content

### Implementation Priority

The core change is surprisingly small - just swapping which marker the server uses for pending content. The rest leverages existing Svelte hydration infrastructure.

This approach prioritizes simplicity and reuse over complex optimization, which aligns with Svelte's philosophy of doing more with less code.
