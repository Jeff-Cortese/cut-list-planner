import { type Project, type CutPiece, type StockItem, type ProjectSettings, createProject, createId } from '../types';
import { saveProject, loadProjects, deleteProject as deleteFromStorage } from '../persistence/localStorage';

let projects = $state<Project[]>([]);
let currentProject = $state<Project | null>(null);

export function getProjects() {
	return projects;
}

export function getCurrentProject() {
	return currentProject;
}

export function initProjects() {
	projects = loadProjects();
	if (projects.length > 0) {
		currentProject = projects[0];
	}
}

export function newProject(name: string) {
	const project = createProject(name);
	projects.push(project);
	currentProject = project;
	saveProject(project);
}

export function selectProject(id: string) {
	const p = projects.find((proj) => proj.id === id);
	if (p) currentProject = p;
}

export function deleteCurrentProject() {
	if (!currentProject) return;
	deleteFromStorage(currentProject.id);
	projects = projects.filter((p) => p.id !== currentProject!.id);
	currentProject = projects.length > 0 ? projects[0] : null;
}

export function importProjectData(project: Project) {
	const existing = projects.find((p) => p.id === project.id);
	if (existing) {
		Object.assign(existing, project);
		currentProject = existing;
	} else {
		projects.push(project);
		currentProject = project;
	}
	saveProject(project);
}

export function addCutPiece(piece: Omit<CutPiece, 'id'>) {
	if (!currentProject) return;
	currentProject.cutPieces.push({ ...piece, id: createId() });
	persist();
}

export function updateCutPiece(id: string, updates: Partial<CutPiece>) {
	if (!currentProject) return;
	const piece = currentProject.cutPieces.find((p) => p.id === id);
	if (piece) Object.assign(piece, updates);
	persist();
}

export function removeCutPiece(id: string) {
	if (!currentProject) return;
	currentProject.cutPieces = currentProject.cutPieces.filter((p) => p.id !== id);
	persist();
}

export function addStockItem(item: Omit<StockItem, 'id'>) {
	if (!currentProject) return;
	currentProject.stockItems.push({ ...item, id: createId() });
	persist();
}

export function updateStockItem(id: string, updates: Partial<StockItem>) {
	if (!currentProject) return;
	const item = currentProject.stockItems.find((s) => s.id === id);
	if (item) Object.assign(item, updates);
	persist();
}

export function removeStockItem(id: string) {
	if (!currentProject) return;
	currentProject.stockItems = currentProject.stockItems.filter((s) => s.id !== id);
	persist();
}

export function updateSettings(updates: Partial<ProjectSettings>) {
	if (!currentProject) return;
	Object.assign(currentProject.settings, updates);
	persist();
}

function persist() {
	if (currentProject) {
		saveProject(currentProject);
	}
}
