export interface CutPiece {
	id: string;
	label: string;
	length: number;
	width?: number;
	quantity: number;
	material: string;
}

export interface StockItem {
	id: string;
	label: string;
	length: number;
	width?: number;
	material: string;
	price?: number;
}

export interface Placement {
	piece: CutPiece;
	x: number;
	y?: number;
	rotated?: boolean;
}

export interface CutResult {
	stockItem: StockItem;
	placements: Placement[];
	wastePercent: number;
}

export interface ProjectSettings {
	units: 'in' | 'mm' | 'cm';
	kerfWidth: number;
	allowRotation: boolean;
}

export interface Project {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	cutPieces: CutPiece[];
	stockItems: StockItem[];
	settings: ProjectSettings;
}

export type CutMode = '1d' | '2d';

export function createId(): string {
	return crypto.randomUUID();
}

export function defaultSettings(): ProjectSettings {
	return {
		units: 'in',
		kerfWidth: 0.125,
		allowRotation: true
	};
}

export function createProject(name: string): Project {
	return {
		id: createId(),
		name,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		cutPieces: [],
		stockItems: [],
		settings: defaultSettings()
	};
}
