export enum Action {}

export type Inputs = {
	actions: {
		[action: string]: Action;
	};
};

export type ActionOf<T extends Inputs> = keyof T['actions'];
