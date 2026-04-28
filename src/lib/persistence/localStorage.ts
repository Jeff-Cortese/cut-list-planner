import type { Project } from '../types';

const STORAGE_KEY = 'cut-list-planner-projects';

export function loadProjects(): Project[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export function saveProjects(projects: Project[]): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function saveProject(project: Project): void {
	const projects = loadProjects();
	const idx = projects.findIndex((p) => p.id === project.id);
	const updated = { ...project, updatedAt: new Date().toISOString() };
	if (idx >= 0) {
		projects[idx] = updated;
	} else {
		projects.push(updated);
	}
	saveProjects(projects);
}

export function deleteProject(id: string): void {
	const projects = loadProjects().filter((p) => p.id !== id);
	saveProjects(projects);
}
