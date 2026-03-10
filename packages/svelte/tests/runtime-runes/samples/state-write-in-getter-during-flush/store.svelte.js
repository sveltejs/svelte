const DEFAULT_WIDTH = 420;
let active = $state(false);
let panelWidth = $state(null);

export const store = {
	get active() { return active; },
	open() { active = true; },
	close() { active = false; },
	// This getter lazily writes $state on first read
	get panelWidth() {
		if (panelWidth === null) panelWidth = DEFAULT_WIDTH;
		return panelWidth;
	}
};
