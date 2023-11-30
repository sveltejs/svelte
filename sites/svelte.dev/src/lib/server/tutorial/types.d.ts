export interface TutorialDatum {
	title: string;
	slug: string;
	tutorials: {
		title: string;
		slug: string;
		dir: string;
		content: string;
		initial: CompletionState[];
		complete: CompletionState[];
	}[];
}

export interface CompletionState {
	name: string;
	type: string;
	content: string;
}

export type TutorialData = TutorialDatum[];

export interface Tutorial {
	title: string;
	slug: string;
}

export interface TutorialSection {
	title: string;
	tutorials: Tutorial[];
}

export type TutorialsList = TutorialSection[];
