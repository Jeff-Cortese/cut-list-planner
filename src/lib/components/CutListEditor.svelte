<script lang="ts">
	import { createId } from '$lib/types';
	import type { CutPiece, CutMode } from '$lib/types';
	import { addCutPiece, removeCutPiece, updateCutPiece, getCurrentProject } from '$lib/stores/project.svelte';

	let { mode = '1d' as CutMode } = $props();

	let label = $state('');
	let length = $state('');
	let width = $state('');
	let quantity = $state('1');
	let material = $state('');
	let editingId = $state<string | null>(null);

	const project = $derived(getCurrentProject());
	const pieces = $derived(project?.cutPieces ?? []);

	function handleAdd() {
		const l = parseFloat(length);
		const w = mode === '2d' ? parseFloat(width) : undefined;
		const q = parseInt(quantity) || 1;
		if (!l || l <= 0) return;
		if (mode === '2d' && (!w || w <= 0)) return;

		if (editingId) {
			updateCutPiece(editingId, {
				label: label || 'Untitled',
				length: l,
				width: w,
				quantity: q,
				material: material || 'default'
			});
			editingId = null;
		} else {
			addCutPiece({
				label: label || 'Untitled',
				length: l,
				width: w,
				quantity: q,
				material: material || 'default'
			});
		}

		label = '';
		length = '';
		width = '';
		quantity = '1';
		material = '';
	}

	function startEdit(piece: CutPiece) {
		editingId = piece.id;
		label = piece.label;
		length = String(piece.length);
		width = piece.width ? String(piece.width) : '';
		quantity = String(piece.quantity);
		material = piece.material;
	}

	function cancelEdit() {
		editingId = null;
		label = '';
		length = '';
		width = '';
		quantity = '1';
		material = '';
	}
</script>

<div class="space-y-4">
	<h3 class="text-lg font-semibold text-gray-800">Cut List</h3>

	<!-- Input form -->
	<div class="flex flex-wrap gap-2 items-end">
		<div class="flex flex-col">
			<label class="text-xs text-gray-500 mb-1">Label</label>
			<input bind:value={label} placeholder="Part name" class="border rounded px-2 py-1.5 text-sm w-32" />
		</div>
		<div class="flex flex-col">
			<label class="text-xs text-gray-500 mb-1">Length</label>
			<input bind:value={length} type="number" step="any" min="0" placeholder="0" class="border rounded px-2 py-1.5 text-sm w-20" />
		</div>
		{#if mode === '2d'}
			<div class="flex flex-col">
				<label class="text-xs text-gray-500 mb-1">Width</label>
				<input bind:value={width} type="number" step="any" min="0" placeholder="0" class="border rounded px-2 py-1.5 text-sm w-20" />
			</div>
		{/if}
		<div class="flex flex-col">
			<label class="text-xs text-gray-500 mb-1">Qty</label>
			<input bind:value={quantity} type="number" min="1" class="border rounded px-2 py-1.5 text-sm w-16" />
		</div>
		<div class="flex flex-col">
			<label class="text-xs text-gray-500 mb-1">Material</label>
			<input bind:value={material} placeholder="e.g. Oak" class="border rounded px-2 py-1.5 text-sm w-24" />
		</div>
		<button onclick={handleAdd} class="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 transition">
			{editingId ? 'Update' : 'Add'}
		</button>
		{#if editingId}
			<button onclick={cancelEdit} class="text-gray-500 px-3 py-1.5 rounded text-sm hover:bg-gray-100 transition">
				Cancel
			</button>
		{/if}
	</div>

	<!-- Table -->
	{#if pieces.length > 0}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left text-gray-500">
						<th class="py-2 pr-4">Label</th>
						<th class="py-2 pr-4">Length</th>
						{#if mode === '2d'}<th class="py-2 pr-4">Width</th>{/if}
						<th class="py-2 pr-4">Qty</th>
						<th class="py-2 pr-4">Material</th>
						<th class="py-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each pieces as piece (piece.id)}
						<tr class="border-b border-gray-100 hover:bg-gray-50">
							<td class="py-2 pr-4">{piece.label}</td>
							<td class="py-2 pr-4">{piece.length}</td>
							{#if mode === '2d'}<td class="py-2 pr-4">{piece.width ?? '—'}</td>{/if}
							<td class="py-2 pr-4">{piece.quantity}</td>
							<td class="py-2 pr-4">{piece.material}</td>
							<td class="py-2 space-x-2">
								<button onclick={() => startEdit(piece)} class="text-blue-600 hover:underline">Edit</button>
								<button onclick={() => removeCutPiece(piece.id)} class="text-red-500 hover:underline">Delete</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-gray-400 text-sm italic">No pieces added yet. Add cut pieces above.</p>
	{/if}
</div>
