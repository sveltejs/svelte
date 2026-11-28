// This file is checked both with `tsconfig.json` and with `tsconfig.non-strict.json`,
// to make sure that the public types also work in projects that don't use `strict`
// (in particular `strictNullChecks`), so it can only contain assertions that hold in both cases

import { hydrate, mount, SvelteComponent, type Component, type MountOptions } from 'svelte';
import { createRenderer } from 'svelte/renderer';

const component = null as any as Component<{ prop: string }>;
const component_without_props = null as any as Component<{}>;
class LegacyComponent extends SvelteComponent<{ prop: string }> {}
const target = null as any as Document | Element | ShadowRoot;

// --------------------------------------------------------------------------- DOM

mount(component, { target, props: { prop: 'foo' } });
mount(component, { target, anchor: null as any as Node, props: { prop: 'foo' }, intro: false });
mount(component_without_props, { target });
mount(LegacyComponent, { target, props: { prop: 'foo' } });
mount(component, {
	// @ts-expect-error without a custom renderer, the target must be a DOM node
	target: { kind: 'element' },
	props: { prop: 'foo' }
});

hydrate(component, { target, props: { prop: 'foo' } });

// a union of `hydrate` and `mount` is callable
const mount_or_hydrate = Math.random() > 0.5 ? hydrate : mount;
mount_or_hydrate(component, { target, props: { prop: 'foo' } });

const options: MountOptions = { target };
const options_with_props: MountOptions<{ prop: string }> = { target, props: { prop: 'foo' } };

// --------------------------------------------------------------------------- custom renderer

type CustomFragment = { kind: 'fragment' };
type CustomElement = { kind: 'element' };
type CustomText = { kind: 'text' };
type CustomComment = { kind: 'comment' };
const custom_renderer = createRenderer<{
	fragment: CustomFragment;
	element: CustomElement;
	text: CustomText;
	comment: CustomComment;
}>(null as any);

mount(component, {
	renderer: custom_renderer,
	target: null as any as CustomFragment,
	anchor: null as any as CustomComment,
	props: { prop: 'foo' }
});
mount(component, {
	renderer: custom_renderer,
	// @ts-expect-error the target must match the renderer
	target: null as any as HTMLElement,
	props: { prop: 'foo' }
});
