import { ComponentConstructorOptions } from '$runtime/internal/public.js';

type NoProps = ComponentConstructorOptions;

const n1: NoProps = {
	target: document.body
};

const n2: NoProps = {
	target: document.body,
	// @ts-expect-error does not accept props
	props: {}
};

const n3: NoProps = {
	target: document.body,
	// @ts-expect-error does not accept any props
	props: {
		img: ''
	}
};

type Props = ComponentConstructorOptions<{ img: string }>;

// @ts-expect-error
const p1: Props = {
	target: document.body
};

const p2: Props = {
	target: document.body,
	// @ts-expect-error required prop is missing
	props: {}
};

const p3: Props = {
	target: document.body,
	props: {
		img: ''
	}
};

type OptionalProps = ComponentConstructorOptions<{ img?: string }>;

const o1: OptionalProps = {
	target: document.body
};

const o2: OptionalProps = {
	target: document.body,
	props: {}
};

const o3: OptionalProps = {
	target: document.body,
	props: {
		img: ''
	}
};
