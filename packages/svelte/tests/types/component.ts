import { asClassComponent, createClassComponent } from 'svelte/legacy';
import {
	SvelteComponent,
	type ComponentEvents,
	type ComponentProps,
	type ComponentType,
	mount,
	hydrate
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

class NewComponent extends SvelteComponent<
	{ prop: string },
	{ event: MouseEvent },
	{ slot: { slotProps: boolean } }
> {
	anExport: string = '';
}

new NewComponent({
	target: null as any,
	props: {
		prop: 'foo',
		// @ts-expect-error
		x: ''
	}
});

const newComponent: NewComponent = new NewComponent({
	target: null as any,
	props: {
		prop: 'foo'
	}
});
newComponent.$$events_def.event;
// @ts-expect-error
newComponent.$$events_def.x;
newComponent.$$slot_def.slot;
// @ts-expect-error
newComponent.$$slot_def.x;
newComponent.anExport === '';
// @ts-expect-error
newComponent.anExport === 1;

const newComponentType: ComponentType<NewComponent> = NewComponent;

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

mount(NewComponent, {
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

hydrate(NewComponent, {
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

// --------------------------------------------------------------------------- interop

const AsLegacyComponent = asClassComponent(newComponent);
new AsLegacyComponent({
	target: null as any,
	props: {
		prop: '',
		// @ts-expect-error
		x: ''
	}
});
const asLegacyComponent = new AsLegacyComponent({
	target: null as any,
	props: {
		prop: ''
	}
});
asLegacyComponent.$on('event', (e) => e.clientX);
// @ts-expect-error
asLegacyComponent.$on('event', (e) => e.foo);
// @ts-expect-error
asLegacyComponent.$on('bar', (e) => e);
asLegacyComponent.$$prop_def.prop = '';
asLegacyComponent.anExport = '';
// @ts-expect-error
asLegacyComponent.$$prop_def.anExport = 1;
// @ts-expect-error
asLegacyComponent.$$prop_def.prop = 1;
// @ts-expect-error
asLegacyComponent.$$prop_def.x = '';
asLegacyComponent.anExport;
const x: typeof asLegacyComponent = createClassComponent({
	target: null as any,
	hydrate: true,
	component: newComponent
});
