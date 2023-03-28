export type TutorialData = {
	title: string;
	slug: string;
	tutorials: {
		title: string;
		slug: string;
		dir: string;
		content: string;
		initial: { name: string; type: string; content: string }[];
		complete: { name: string; type: string; content: string }[];
	}[];
}[];

export interface Tutorial {
	title: string;
	slug: string;
}

export interface TutorialSection {
	title: string;
	tutorials: Tutorial[];
}

export type TutorialsList = TutorialSection[];
