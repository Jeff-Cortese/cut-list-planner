<script lang="ts">
	import { onMount } from 'svelte';
	import { initProjects, getCurrentProject, newProject } from '$lib/stores/project.svelte';
	import { optimize1D, optimize2D } from '$lib/optimizer';
	import type { CutResult, CutMode } from '$lib/types';
	import ProjectManager from '$lib/components/ProjectManager.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import CutListEditor from '$lib/components/CutListEditor.svelte';
	import StockEditor from '$lib/components/StockEditor.svelte';
	import CutDiagram1D from '$lib/components/CutDiagram1D.svelte';
	import CutDiagram2D from '$lib/components/CutDiagram2D.svelte';
	import ShoppingList from '$lib/components/ShoppingList.svelte';

	let mode = $state<CutMode>('1d');
	let results1D = $state<CutResult[]>([]);
	let results2D = $state<CutResult[]>([]);

	const project = $derived(getCurrentProject());

	onMount(() => {
		initProjects();
		if (!getCurrentProject()) {
			newProject('My First Project');
		}
	});

	function runOptimizer() {
		if (!project) return;
		const settings = project.settings;

		results1D = optimize1D(
			project.cutPieces.filter((p) => !p.width),
			project.stockItems,
			{ kerfWidth: settings.kerfWidth }
		);

		results2D = optimize2D(
			project.cutPieces.filter((p) => p.width),
			project.stockItems,
			{ kerfWidth: settings.kerfWidth, allowRotation: settings.allowRotation }
		);
	}

	const allResults = $derived([...results1D, ...results2D]);
</script>

<svelte:head>
	<title>Cut List Planner</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white border-b shadow-sm">
		<div class="max-w-6xl mx-auto px-4 py-3">
			<div class="flex items-center justify-between mb-3">
				<h1 class="text-xl font-bold text-gray-800">🪵 Cut List Planner</h1>
				<div class="flex items-center gap-2">
					<button
						onclick={() => (mode = '1d')}
						class="px-3 py-1 rounded text-sm transition {mode === '1d' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
					>
						1D (Lumber)
					</button>
					<button
						onclick={() => (mode = '2d')}
						class="px-3 py-1 rounded text-sm transition {mode === '2d' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
					>
						2D (Sheets)
					</button>
				</div>
			</div>
			<ProjectManager />
		</div>
	</header>

	{#if project}
		<main class="max-w-6xl mx-auto px-4 py-6 space-y-8">
			<!-- Settings -->
			<section class="bg-white rounded-lg shadow-sm p-4">
				<Settings />
			</section>

			<!-- Editors -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<section class="bg-white rounded-lg shadow-sm p-4">
					<CutListEditor {mode} />
				</section>
				<section class="bg-white rounded-lg shadow-sm p-4">
					<StockEditor {mode} />
				</section>
			</div>

			<!-- Optimize button -->
			<div class="flex justify-center">
				<button
					onclick={runOptimizer}
					class="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition shadow-sm"
				>
					⚡ Optimize Cuts
				</button>
			</div>

			<!-- Results -->
			{#if allResults.length > 0}
				<div class="space-y-6">
					{#if results1D.length > 0}
						<section class="bg-white rounded-lg shadow-sm p-4">
							<CutDiagram1D results={results1D} />
						</section>
					{/if}

					{#if results2D.length > 0}
						<section class="bg-white rounded-lg shadow-sm p-4">
							<CutDiagram2D results={results2D} />
						</section>
					{/if}

					<section class="bg-white rounded-lg shadow-sm p-4">
						<ShoppingList results={allResults} />
					</section>
				</div>
			{/if}
		</main>
	{/if}
</div>
