<script lang="ts">
	import type { CutResult } from '$lib/types';

	let { results = [] as CutResult[] } = $props();

	const COLORS = [
		'#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
		'#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
	];

	function getColor(index: number): string {
		return COLORS[index % COLORS.length];
	}

	const DIAGRAM_WIDTH = 700;
	const BAR_HEIGHT = 40;
	const GAP = 12;
</script>

<div class="space-y-4">
	<h3 class="text-lg font-semibold text-gray-800">Cut Diagrams — 1D</h3>

	{#if results.length === 0}
		<p class="text-gray-400 text-sm italic">No optimization results yet.</p>
	{:else}
		{#each results as result, boardIdx}
			{@const scale = DIAGRAM_WIDTH / result.stockItem.length}
			<div class="space-y-1">
				<div class="text-xs text-gray-500">
					{result.stockItem.label} ({result.stockItem.length}" {result.stockItem.material}) — {result.wastePercent.toFixed(1)}% waste
				</div>
				<svg width={DIAGRAM_WIDTH + 2} height={BAR_HEIGHT + 20} class="border rounded bg-white">
					<!-- Stock background (waste) -->
					<rect x="1" y="1" width={DIAGRAM_WIDTH} height={BAR_HEIGHT} fill="#e5e7eb" rx="2" />

					<!-- Placed pieces -->
					{#each result.placements as placement, i}
						{@const x = placement.x * scale}
						{@const w = placement.piece.length * scale}
						<rect
							{x}
							y="1"
							width={Math.max(w - 1, 1)}
							height={BAR_HEIGHT}
							fill={getColor(i)}
							rx="2"
							opacity="0.85"
						>
							<title>{placement.piece.label}: {placement.piece.length}"</title>
						</rect>
						{#if w > 30}
							<text
								x={x + w / 2}
								y={BAR_HEIGHT / 2 + 1}
								text-anchor="middle"
								dominant-baseline="middle"
								class="text-[10px] fill-white font-medium pointer-events-none"
							>
								{placement.piece.label}
							</text>
						{/if}
					{/each}

					<!-- Length label -->
					<text x={DIAGRAM_WIDTH / 2} y={BAR_HEIGHT + 14} text-anchor="middle" class="text-[10px] fill-gray-400">
						{result.stockItem.length}"
					</text>
				</svg>
			</div>
		{/each}
	{/if}
</div>
