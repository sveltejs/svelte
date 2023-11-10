export type TaskCallback = (now: number) => boolean | void;

export type TaskEntry = { c: TaskCallback; f: () => void };

export interface Task {
	abort(): void;
	promise: Promise<void>;
}
