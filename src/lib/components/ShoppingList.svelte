<script lang="ts">
	import type { CutResult } from '$lib/types';
	import { exportCSV } from '$lib/persistence/fileIO';

	let { results = [] as CutResult[] } = $props();

	interface ShoppingItem {
		label: string;
		material: string;
		quantity: number;
		price?: number;
		totalPrice?: number;
	}

	const shoppingList = $derived.by(() => {
		const map = new Map<string, ShoppingItem>();
		for (const r of results) {
			const key = `${r.stockItem.label}|${r.stockItem.material}`;
			const existing = map.get(key);
			if (existing) {
				existing.quantity++;
				if (existing.price) existing.totalPrice = existing.quantity * existing.price;
			} else {
				map.set(key, {
					label: r.stockItem.label,
					material: r.stockItem.material,
					quantity: 1,
					price: r.stockItem.price,
					totalPrice: r.stockItem.price
				});
			}
		}
		return Array.from(map.values());
	});

	const totalCost = $derived(
		shoppingList.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0)
	);

	const avgWaste = $derived(
		results.length > 0
			? results.reduce((sum, r) => sum + r.wastePercent, 0) / results.length
			: 0
	);

	function handleExportCSV() {
		exportCSV(shoppingList.map((item) => ({
			label: `${item.label} (${item.material})`,
			quantity: item.quantity,
			price: item.totalPrice
		})));
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold text-gray-800">Shopping List</h3>
		{#if shoppingList.length > 0}
			<button onclick={handleExportCSV} class="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition">
				Export CSV
			</button>
		{/if}
	</div>

	{#if shoppingList.length === 0}
		<p class="text-gray-400 text-sm italic">Run optimizer to see shopping list.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left text-gray-500">
						<th class="py-2 pr-4">Item</th>
						<th class="py-2 pr-4">Material</th>
						<th class="py-2 pr-4">Quantity</th>
						<th class="py-2 pr-4">Unit Price</th>
						<th class="py-2">Total</th>
					</tr>
				</thead>
				<tbody>
					{#each shoppingList as item}
						<tr class="border-b border-gray-100">
							<td class="py-2 pr-4">{item.label}</td>
							<td class="py-2 pr-4">{item.material}</td>
							<td class="py-2 pr-4">{item.quantity}</td>
							<td class="py-2 pr-4">{item.price ? `$${item.price.toFixed(2)}` : '—'}</td>
							<td class="py-2">{item.totalPrice ? `$${item.totalPrice.toFixed(2)}` : '—'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Summary -->
		<div class="flex gap-6 text-sm">
			{#if totalCost > 0}
				<div class="bg-green-50 px-3 py-2 rounded">
					<span class="text-gray-500">Total Cost:</span>
					<span class="font-semibold text-green-700">${totalCost.toFixed(2)}</span>
				</div>
			{/if}
			<div class="bg-yellow-50 px-3 py-2 rounded">
				<span class="text-gray-500">Avg Waste:</span>
				<span class="font-semibold text-yellow-700">{avgWaste.toFixed(1)}%</span>
			</div>
			<div class="bg-blue-50 px-3 py-2 rounded">
				<span class="text-gray-500">Total Boards/Sheets:</span>
				<span class="font-semibold text-blue-700">{results.length}</span>
			</div>
		</div>
	{/if}
</div>
