<script lang="ts">
	import type { StockItem, CutMode } from '$lib/types';
	import { addStockItem, removeStockItem, updateStockItem, getCurrentProject } from '$lib/stores/project.svelte';

	let { mode = '1d' as CutMode } = $props();

	let label = $state('');
	let length = $state('');
	let width = $state('');
	let material = $state('');
	let price = $state('');
	let editingId = $state<string | null>(null);

	const project = $derived(getCurrentProject());
	const items = $derived(project?.stockItems ?? []);

	const presets1D = [
		{ label: '6ft Board', length: 72 },
		{ label: '8ft Board', length: 96 },
		{ label: '10ft Board', length: 120 },
		{ label: '12ft Board', length: 144 },
		{ label: '16ft Board', length: 192 }
	];

	const presets2D = [
		{ label: '4×8 Sheet', length: 96, width: 48 },
		{ label: '4×4 Sheet', length: 48, width: 48 },
		{ label: '2×4 Sheet', length: 48, width: 24 }
	];

	function handleAdd() {
		const l = parseFloat(length);
		const w = mode === '2d' ? parseFloat(width) : undefined;
		const p = parseFloat(price) || undefined;
		if (!l || l <= 0) return;
		if (mode === '2d' && (!w || w <= 0)) return;

		if (editingId) {
			updateStockItem(editingId, {
				label: label || 'Stock',
				length: l,
				width: w,
				material: material || 'default',
				price: p
			});
			editingId = null;
		} else {
			addStockItem({
				label: label || 'Stock',
				length: l,
				width: w,
				material: material || 'default',
				price: p
			});
		}

		label = '';
		length = '';
		width = '';
		material = '';
		price = '';
	}

	function applyPreset(preset: { label: string; length: number; width?: number }) {
		label = preset.label;
		length = String(preset.length);
		if (preset.width) width = String(preset.width);
	}

	function startEdit(item: StockItem) {
		editingId = item.id;
		label = item.label;
		length = String(item.length);
		width = item.width ? String(item.width) : '';
		material = item.material;
		price = item.price ? String(item.price) : '';
	}

	function cancelEdit() {
		editingId = null;
		label = '';
		length = '';
		width = '';
		material = '';
		price = '';
	}
</script>

<div class="space-y-4">
	<h3 class="text-lg font-semibold text-gray-800">Available Stock</h3>

	<!-- Presets -->
	<div class="flex flex-wrap gap-1">
		<span class="text-xs text-gray-500 mr-1 self-center">Presets:</span>
		{#each mode === '2d' ? presets2D : presets1D as preset}
			<button
				onclick={() => applyPreset(preset)}
				class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
			>
				{preset.label}
			</button>
		{/each}
	</div>

	<!-- Input form -->
	<div class="flex flex-wrap gap-2 items-end">
		<div class="flex flex-col">
			<label class="text-xs text-gray-500 mb-1">Label</label>
			<input bind:value={label} placeholder="Stock name" class="border rounded px-2 py-1.5 text-sm w-32" />
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
			<label class="text-xs text-gray-500 mb-1">Material</label>
			<input bind:value={material} placeholder="e.g. Oak" class="border rounded px-2 py-1.5 text-sm w-24" />
		</div>
		<div class="flex flex-col">
			<label class="text-xs text-gray-500 mb-1">Price ($)</label>
			<input bind:value={price} type="number" step="0.01" min="0" placeholder="0.00" class="border rounded px-2 py-1.5 text-sm w-20" />
		</div>
		<button onclick={handleAdd} class="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700 transition">
			{editingId ? 'Update' : 'Add'}
		</button>
		{#if editingId}
			<button onclick={cancelEdit} class="text-gray-500 px-3 py-1.5 rounded text-sm hover:bg-gray-100 transition">
				Cancel
			</button>
		{/if}
	</div>

	<!-- Table -->
	{#if items.length > 0}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left text-gray-500">
						<th class="py-2 pr-4">Label</th>
						<th class="py-2 pr-4">Length</th>
						{#if mode === '2d'}<th class="py-2 pr-4">Width</th>{/if}
						<th class="py-2 pr-4">Material</th>
						<th class="py-2 pr-4">Price</th>
						<th class="py-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each items as item (item.id)}
						<tr class="border-b border-gray-100 hover:bg-gray-50">
							<td class="py-2 pr-4">{item.label}</td>
							<td class="py-2 pr-4">{item.length}</td>
							{#if mode === '2d'}<td class="py-2 pr-4">{item.width ?? '—'}</td>{/if}
							<td class="py-2 pr-4">{item.material}</td>
							<td class="py-2 pr-4">{item.price ? `$${item.price.toFixed(2)}` : '—'}</td>
							<td class="py-2 space-x-2">
								<button onclick={() => startEdit(item)} class="text-blue-600 hover:underline">Edit</button>
								<button onclick={() => removeStockItem(item.id)} class="text-red-500 hover:underline">Delete</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-gray-400 text-sm italic">No stock defined yet. Add stock sizes above or use a preset.</p>
	{/if}
</div>
