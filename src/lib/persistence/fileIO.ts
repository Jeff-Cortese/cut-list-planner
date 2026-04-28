import type { Project } from '../types';

export function exportProject(project: Project): void {
	const json = JSON.stringify(project, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.json`;
	a.click();
	URL.revokeObjectURL(url);
}

export function importProject(file: File): Promise<Project> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const project = JSON.parse(reader.result as string) as Project;
				if (!project.id || !project.name || !project.cutPieces || !project.stockItems) {
					reject(new Error('Invalid project file'));
					return;
				}
				resolve(project);
			} catch {
				reject(new Error('Failed to parse project file'));
			}
		};
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsText(file);
	});
}

export function exportCSV(rows: { label: string; quantity: number; price?: number }[]): void {
	const header = 'Item,Quantity,Price';
	const lines = rows.map((r) => `"${r.label}",${r.quantity},${r.price ?? ''}`);
	const csv = [header, ...lines].join('\n');
	const blob = new Blob([csv], { type: 'text/csv' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'shopping-list.csv';
	a.click();
	URL.revokeObjectURL(url);
}
