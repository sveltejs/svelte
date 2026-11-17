# Whole-script replay implementation contract

This is the coordinated next-step ABI and semantics following the user's 2026-11-17 decision. It supersedes the prototype's stable user-code prefix. It is an implementation contract, not evidence that the work already passes.

## User-visible contract

- Every admitted initializer runs the entire instance script, including code before its first await. Imports/module evaluation and compiler lifecycle scaffolding are not instance initialization work.
- Until publication, state and ordinary initialization values belong to the attempt. A real attempt initialized from input 2 does not inherit state initialized by a speculative input-1 creator.
- Initialization-caused writes stay in their current canonical batch. They may update reactive producers, but do not restart initialization or repeat ordinary initialization statements in that view.
- External writes form a new batch and admit fresh initialization while the instance remains unpublished. External rebasing can invalidate and replace an unfinished attempt.
- Publication preserves the winning environment, state identities, resource lifetime, and presentation. Later ordinary updates do not replay initialization. A failed fork retains its current cached error; committing is not retrying.

## Pinned compiler/runtime ABI

Keep the four-argument call:

```js
script_replay(factory, kinds, checkpoints, groups);
```

The factory becomes:

```js
function factory(stage_bindings, facade) {
	// All ordinary synchronous initialization executes here, with native lexical
	// compiler transforms and fresh bindings/closures for this attempt.
	// ...
	return {
		thunks: [/* continuation/producer callbacks and atomic group callbacks */],
		environment: [
			{
				reactive: true,
				read: () => /* native binding read */,
				assign: (value, proxy) => /* native assignment */,
				update: (delta, pre) => /* native ++/-- semantics */
				// mutate is optional and must preserve native evaluation order
			}
		]
	};
}
```

- `environment` is **an array of accessor objects**, not parallel reads/assigns/updates arrays.
- Each accessor has `reactive` and `read`; write hooks are optional.
- `facade.read(index)` uses equality-preserving value projections for reactive bindings and immutable `const` bindings. Caching a const object's reference does not freeze its mutable properties. Mutable ordinary locals and reassignable function getters are invoked live, not cached as reactive values.
- `facade.get(index)` selects the accessor before evaluation of assignment RHS or update arguments. Suffix code emits, for example, `facade.get(i).assign(rhs, proxy)`.
- Template/live-handler equivalents are `script_read(script, index)` and `script_accessor(script, index)`.
- No fifth metadata argument and no intermediate `initialize(slot, value)` protocol are needed for this step. Prefix helpers execute against native lexical bindings inside the factory.
- `facade.state(slot, nativeSource)` associates an actual state source with its logical binding and applies any explicit external write for that binding in the incoming batch before following prefix statements read it. The state initializer expression still executes. Initialization-origin writes do not become external overrides. This hook is not a claim of support for preserving deep proxy-field edits across fresh proxy allocation.
- Suffix callbacks access formerly-prefix bindings through the stable facade, not raw losing-attempt captures. Event handlers resolve the selected function/environment at invocation time.
- The factory runs synchronously; its environment is published before producer stages or template construction can consume it.
- `script.environment_ready` is a tagged `ScriptReadiness` with checkpoint `-1`. It becomes true only after the environment is published. Compiler blocker caches must be invalidated when adding this blocker to formerly-unblocked bindings. Existing later checkpoints remain in force.
- Internal hand-written factories returning only a thunk array may remain compatible temporarily; that does not authorize retaining user prefix code outside a generated factory.

Mutation hooks must select/read their target before RHS execution and must not mix environments if the RHS reenters the runtime. Unsupported hook forms must remain explicit rather than silently changing JavaScript evaluation order.

## Runtime execution context

Track initializer reads without treating ordinary initializer code as a user derived expression. A synchronous initialization context identifies its attempt, canonical batch, and stable reaction. Mutation permission applies only to that reaction; nested derived/inspect executions retain their normal restrictions.

Initialization writes carry provenance, remain in the current batch rather than `legacy_updates`, and cannot make that batch's initialization restart. An initialization-origin write rebased from another batch is external to the receiving view. External invalidation wins when causes combine. Completed initialization stages must retain their read subscriptions when an own-write invalidation is suppressed; skipping only after `update_effect` has replaced dependencies is insufficient.

The context ends at suspension. It must not leak into foreign microtasks or opaque helper continuations. Framework-instrumented suspensions must validate the attempt/run before restoring context. Attribution of writes in an opaque helper's own uninstrumented async continuation remains an explicit implementation obligation; lack of runtime context is not evidence that such a causally initialization-owned write satisfies the intended external-write contract.

After another attempt establishes the instance, converting an older healthy attempt to update-only behavior must be coherent: do not let its unfinished imperative code mutate the winner's state while retaining losing lexical captures. Private failed outcomes must not be erased by unrelated publication. Preserve still-valid producer work rather than restarting requests merely to change environments.
