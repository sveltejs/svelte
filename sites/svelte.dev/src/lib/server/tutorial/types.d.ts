export interface Tutorial {
	title: string;
	slug: string;
}

export interface TutorialSection {
	title: string;
	tutorials: Tutorial[];
}

export type TutorialsList = TutorialSection[];
