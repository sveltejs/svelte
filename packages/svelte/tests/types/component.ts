import { SvelteComponent, asClassComponent, createClassComponent } from 'svelte/legacy';
import {
	createRoot,
	type Component,
	type ComponentEvents,
	type ComponentProps,
	type ComponentType
} from 'svelte';

// --------------------------------------------------------------------------- legacy: classes

class LegacyComponent extends SvelteComponent<
	{ prop: string },
	{ event: MouseEvent },
	{ slot: { slotProps: boolean } }
> {}

const legacyComponent = new LegacyComponent({
	target: null as any as Document | Element | ShadowRoot,
	props: {
		prop: 'foo',
		// @ts-expect-error
		x: ''
	}
});

const legacyComponentType: ComponentType<LegacyComponent> = LegacyComponent;

const legacyComponentProps1: ComponentProps<LegacyComponent> = {
	prop: '',
	// @ts-expect-error
	x: ''
};
const legacyComponentProps2: ComponentProps<LegacyComponent> = {
	// @ts-expect-error
	prop: 1
};

const legacyComponentEvents1: ComponentEvents<LegacyComponent> = {
	event: new MouseEvent('click'),
	// @ts-expect-error
	x: ''
};
const legacyComponentEvents2: ComponentEvents<LegacyComponent> = {
	// @ts-expect-error
	event: new KeyboardEvent('click')
};

// --------------------------------------------------------------------------- new: functions

type NewComponent = Component<
	{ prop: string },
	{ anExport: number },
	{ event: MouseEvent },
	{ slot: { slotProps: boolean } }
>;

const newComponent: NewComponent = {
	z_$$: (props, events, slots) => {
		props.prop;
		// @ts-expect-error
		props.x;

		events.event;
		// @ts-expect-error
		events.x;

		slots.slot;
		// @ts-expect-error
		slots.x;

		return {
			anExport: 1,
			prop: props.prop
		};
	}
};

const newComponentType: ComponentType<NewComponent> = newComponent;

const newComponentProps1: ComponentProps<NewComponent> = {
	prop: '',
	// @ts-expect-error
	x: ''
};
const newComponentProps2: ComponentProps<NewComponent> = {
	// @ts-expect-error
	prop: 1
};

const newComponentEvents1: ComponentEvents<NewComponent> = {
	event: new MouseEvent('click'),
	// @ts-expect-error
	x: ''
};
const newComponentEvents2: ComponentEvents<NewComponent> = {
	// @ts-expect-error
	event: new KeyboardEvent('click')
};

const instance = createRoot(newComponent, {
	target: null as any as Document | Element | ShadowRoot | Text | Comment,
	props: {
		prop: 'foo',
		// @ts-expect-error
		x: ''
	},
	events: {
		event: new MouseEvent('click')
	},
	immutable: true,
	intro: false,
	recover: false
});
instance.$set({
	prop: 'foo',
	// @ts-expect-error
	x: ''
});
instance.$set({});
instance.$destroy();
instance.anExport === 1;

// --------------------------------------------------------------------------- interop

const AsLegacyComponent = asClassComponent(newComponent);
const asLegacyComponent = new AsLegacyComponent({
	target: null as any,
	props: {
		prop: '',
		// @ts-expect-error
		x: ''
	}
});
asLegacyComponent.$on('event', (e) => e.clientX);
// @ts-expect-error
asLegacyComponent.$on('event', (e) => e.foo);
// @ts-expect-error
asLegacyComponent.$on('bar', (e) => e);
asLegacyComponent.$$prop_def.prop = '';
asLegacyComponent.$$prop_def.anExport = 1;
// @ts-expect-error
asLegacyComponent.$$prop_def.prop = 1;
// @ts-expect-error
asLegacyComponent.$$prop_def.x = '';
asLegacyComponent.anExport;
const x: typeof asLegacyComponent = createClassComponent({
	target: null as any,
	component: newComponent
});
