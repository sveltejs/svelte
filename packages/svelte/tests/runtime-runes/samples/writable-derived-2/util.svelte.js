export const createAppState = (options) => {
	const source = $derived(options.source());
	let value = $derived(source);

	return {
		get value() {
			return value;
		},
		onChange(nextValue) {
			value = nextValue;
		}
	};
};

const result = createAppState({ source: () => 'wrong' });
result.onChange('right');
export const expect2 = result.value === 'right';
