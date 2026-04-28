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

	const MAX_WIDTH = 700;
</script>

<div class="space-y-4">
	<h3 class="text-lg font-semibold text-gray-800">Cut Diagrams — 2D</h3>

	{#if results.length === 0}
		<p class="text-gray-400 text-sm italic">No optimization results yet.</p>
	{:else}
		{#each results as result, sheetIdx}
			{@const stockW = result.stockItem.length}
			{@const stockH = result.stockItem.width ?? 48}
			{@const scale = Math.min(MAX_WIDTH / stockW, 400 / stockH)}
			{@const svgW = stockW * scale}
			{@const svgH = stockH * scale}
			<div class="space-y-1">
				<div class="text-xs text-gray-500">
					{result.stockItem.label} ({stockW}×{stockH}" {result.stockItem.material}) — {result.wastePercent.toFixed(1)}% waste
				</div>
				<svg width={svgW + 2} height={svgH + 20} class="border rounded bg-white">
					<!-- Sheet background -->
					<rect x="1" y="1" width={svgW} height={svgH} fill="#e5e7eb" rx="2" />

					<!-- Placed pieces -->
					{#each result.placements as placement, i}
						{@const pl = placement.rotated ? (placement.piece.width ?? 0) : placement.piece.length}
						{@const pw = placement.rotated ? placement.piece.length : (placement.piece.width ?? 0)}
						{@const x = (placement.x ?? 0) * scale}
						{@const y = (placement.y ?? 0) * scale}
						{@const w = pl * scale}
						{@const h = pw * scale}
						<rect
							{x}
							{y}
							width={Math.max(w - 1, 1)}
							height={Math.max(h - 1, 1)}
							fill={getColor(i)}
							rx="1"
							opacity="0.85"
						>
							<title>{placement.piece.label}: {placement.piece.length}×{placement.piece.width}" {placement.rotated ? '(rotated)' : ''}</title>
						</rect>
						{#if w > 30 && h > 14}
							<text
								x={x + w / 2}
								y={y + h / 2}
								text-anchor="middle"
								dominant-baseline="middle"
								class="text-[9px] fill-white font-medium pointer-events-none"
							>
								{placement.piece.label}
							</text>
						{/if}
					{/each}

					<!-- Dimensions -->
					<text x={svgW / 2} y={svgH + 14} text-anchor="middle" class="text-[10px] fill-gray-400">
						{stockW}×{stockH}"
					</text>
				</svg>
			</div>
		{/each}
	{/if}
</div>
