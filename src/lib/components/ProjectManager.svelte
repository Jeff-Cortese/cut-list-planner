<script lang="ts">
	import { getProjects, getCurrentProject, newProject, selectProject, deleteCurrentProject, importProjectData } from '$lib/stores/project.svelte';
	import { exportProject, importProject } from '$lib/persistence/fileIO';

	const projects = $derived(getProjects());
	const current = $derived(getCurrentProject());

	let newName = $state('');
	let showNew = $state(false);
	let fileInput: HTMLInputElement;

	function handleCreate() {
		if (!newName.trim()) return;
		newProject(newName.trim());
		newName = '';
		showNew = false;
	}

	function handleExport() {
		if (current) exportProject(current);
	}

	async function handleImport() {
		const file = fileInput?.files?.[0];
		if (!file) return;
		try {
			const project = await importProject(file);
			importProjectData(project);
		} catch (e) {
			alert(e instanceof Error ? e.message : 'Import failed');
		}
	}

	function handleDelete() {
		if (!current) return;
		if (confirm(`Delete project "${current.name}"? This cannot be undone.`)) {
			deleteCurrentProject();
		}
	}
</script>

<div class="flex items-center gap-3 flex-wrap">
	<!-- Project selector -->
	{#if projects.length > 0}
		<select
			value={current?.id ?? ''}
			onchange={(e) => selectProject((e.target as HTMLSelectElement).value)}
			class="border rounded px-2 py-1.5 text-sm bg-white"
		>
			{#each projects as p (p.id)}
				<option value={p.id}>{p.name}</option>
			{/each}
		</select>
	{/if}

	<!-- New project -->
	{#if showNew}
		<div class="flex gap-1">
			<input
				bind:value={newName}
				placeholder="Project name"
				class="border rounded px-2 py-1.5 text-sm w-40"
				onkeydown={(e) => e.key === 'Enter' && handleCreate()}
			/>
			<button onclick={handleCreate} class="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">Create</button>
			<button onclick={() => { showNew = false; newName = ''; }} class="text-gray-500 px-2 py-1.5 text-sm">✕</button>
		</div>
	{:else}
		<button onclick={() => (showNew = true)} class="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
			+ New Project
		</button>
	{/if}

	<!-- Actions -->
	{#if current}
		<button onclick={handleExport} class="text-sm text-gray-600 hover:text-gray-800 px-2 py-1.5 hover:bg-gray-100 rounded transition">
			Export
		</button>
	{/if}

	<label class="text-sm text-gray-600 hover:text-gray-800 px-2 py-1.5 hover:bg-gray-100 rounded transition cursor-pointer">
		Import
		<input bind:this={fileInput} type="file" accept=".json" class="hidden" onchange={handleImport} />
	</label>

	{#if current}
		<button onclick={handleDelete} class="text-sm text-red-500 hover:text-red-700 px-2 py-1.5 hover:bg-red-50 rounded transition">
			Delete
		</button>
	{/if}
</div>
