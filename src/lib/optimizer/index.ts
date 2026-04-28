import type { CutPiece, StockItem, CutResult, Placement } from '../types';

export interface OptimizerOptions {
	kerfWidth: number;
}

/**
 * 1D First Fit Decreasing bin-packing.
 * Groups pieces by material, matches to stock of same material.
 */
export function optimize1D(
	pieces: CutPiece[],
	stock: StockItem[],
	options: OptimizerOptions
): CutResult[] {
	const { kerfWidth } = options;

	const expanded = expandPieces(pieces);
	expanded.sort((a, b) => b.length - a.length);

	const materialGroups = groupByMaterial(expanded);
	const results: CutResult[] = [];

	for (const [material, materialPieces] of materialGroups) {
		const availableStock = stock
			.filter((s) => s.material === material && !s.width)
			.sort((a, b) => a.length - b.length);

		if (availableStock.length === 0) continue;

		const bins: { stock: StockItem; placements: Placement[]; remaining: number }[] = [];

		for (const piece of materialPieces) {
			let placed = false;

			for (const bin of bins) {
				const needed = piece.length + (bin.placements.length > 0 ? kerfWidth : 0);
				if (bin.remaining >= needed) {
					const x = bin.stock.length - bin.remaining + (bin.placements.length > 0 ? kerfWidth : 0);
					bin.placements.push({ piece, x });
					bin.remaining -= needed;
					placed = true;
					break;
				}
			}

			if (!placed) {
				const stockItem = findBestStock(availableStock, piece.length);
				if (!stockItem) continue;
				const bin = {
					stock: stockItem,
					placements: [{ piece, x: 0 }] as Placement[],
					remaining: stockItem.length - piece.length
				};
				bins.push(bin);
			}
		}

		for (const bin of bins) {
			const usedLength = bin.placements.reduce(
				(sum, p, i) => sum + p.piece.length + (i > 0 ? kerfWidth : 0),
				0
			);
			results.push({
				stockItem: bin.stock,
				placements: bin.placements,
				wastePercent: ((bin.stock.length - usedLength) / bin.stock.length) * 100
			});
		}
	}

	return results;
}

/**
 * 2D Guillotine bin-packing.
 */
export function optimize2D(
	pieces: CutPiece[],
	stock: StockItem[],
	options: OptimizerOptions & { allowRotation: boolean }
): CutResult[] {
	const { kerfWidth, allowRotation } = options;

	const expanded = expandPieces(pieces).filter((p) => p.width !== undefined);
	expanded.sort((a, b) => (b.length * (b.width ?? 0)) - (a.length * (a.width ?? 0)));

	const materialGroups = groupByMaterial(expanded);
	const results: CutResult[] = [];

	for (const [material, materialPieces] of materialGroups) {
		const availableStock = stock
			.filter((s) => s.material === material && s.width)
			.sort((a, b) => (a.length * (a.width ?? 0)) - (b.length * (b.width ?? 0)));

		if (availableStock.length === 0) continue;

		const bins: {
			stock: StockItem;
			placements: Placement[];
			freeRects: Rect[];
		}[] = [];

		for (const piece of materialPieces) {
			const pw = piece.width ?? 0;
			let placed = false;

			for (const bin of bins) {
				const placement = tryPlace(bin.freeRects, piece.length, pw, kerfWidth, allowRotation);
				if (placement) {
					bin.placements.push({ piece, x: placement.x, y: placement.y, rotated: placement.rotated });
					bin.freeRects = splitRect(bin.freeRects, placement, piece.length, pw, kerfWidth);
					placed = true;
					break;
				}
			}

			if (!placed) {
				const stockItem = findBestStock2D(availableStock, piece.length, pw);
				if (!stockItem) continue;
				const freeRects: Rect[] = [{ x: 0, y: 0, w: stockItem.length, h: stockItem.width! }];
				const placement = tryPlace(freeRects, piece.length, pw, kerfWidth, allowRotation);
				if (placement) {
					const newBin = {
						stock: stockItem,
						placements: [{ piece, x: placement.x, y: placement.y, rotated: placement.rotated }],
						freeRects: splitRect(freeRects, placement, piece.length, pw, kerfWidth)
					};
					bins.push(newBin);
				}
			}
		}

		for (const bin of bins) {
			const totalArea = bin.stock.length * (bin.stock.width ?? 1);
			const usedArea = bin.placements.reduce((sum, p) => {
				const l = p.rotated ? (p.piece.width ?? 0) : p.piece.length;
				const w = p.rotated ? p.piece.length : (p.piece.width ?? 0);
				return sum + l * w;
			}, 0);
			results.push({
				stockItem: bin.stock,
				placements: bin.placements,
				wastePercent: ((totalArea - usedArea) / totalArea) * 100
			});
		}
	}

	return results;
}

interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

interface PlaceResult {
	x: number;
	y: number;
	rotated: boolean;
}

function tryPlace(
	freeRects: Rect[],
	length: number,
	width: number,
	kerf: number,
	allowRotation: boolean
): PlaceResult | null {
	for (const rect of freeRects) {
		if (length <= rect.w && width <= rect.h) {
			return { x: rect.x, y: rect.y, rotated: false };
		}
		if (allowRotation && width <= rect.w && length <= rect.h) {
			return { x: rect.x, y: rect.y, rotated: true };
		}
	}
	return null;
}

function splitRect(
	freeRects: Rect[],
	placement: PlaceResult,
	length: number,
	width: number,
	kerf: number
): Rect[] {
	const pl = placement.rotated ? width : length;
	const pw = placement.rotated ? length : width;

	const newRects: Rect[] = [];

	for (const rect of freeRects) {
		if (
			placement.x >= rect.x + rect.w ||
			placement.x + pl <= rect.x ||
			placement.y >= rect.y + rect.h ||
			placement.y + pw <= rect.y
		) {
			newRects.push(rect);
			continue;
		}

		// Right remainder
		const rightX = placement.x + pl + kerf;
		if (rightX < rect.x + rect.w) {
			newRects.push({ x: rightX, y: rect.y, w: rect.x + rect.w - rightX, h: rect.h });
		}

		// Bottom remainder
		const bottomY = placement.y + pw + kerf;
		if (bottomY < rect.y + rect.h) {
			newRects.push({ x: rect.x, y: bottomY, w: rect.w, h: rect.y + rect.h - bottomY });
		}

		// Top remainder
		if (placement.y > rect.y) {
			newRects.push({ x: rect.x, y: rect.y, w: rect.w, h: placement.y - rect.y - kerf });
		}

		// Left remainder
		if (placement.x > rect.x) {
			newRects.push({ x: rect.x, y: rect.y, w: placement.x - rect.x - kerf, h: rect.h });
		}
	}

	return newRects.filter((r) => r.w > 0 && r.h > 0);
}

function expandPieces(pieces: CutPiece[]): CutPiece[] {
	const result: CutPiece[] = [];
	for (const piece of pieces) {
		for (let i = 0; i < piece.quantity; i++) {
			result.push({ ...piece, quantity: 1 });
		}
	}
	return result;
}

function groupByMaterial(pieces: CutPiece[]): Map<string, CutPiece[]> {
	const map = new Map<string, CutPiece[]>();
	for (const p of pieces) {
		const key = p.material || 'default';
		if (!map.has(key)) map.set(key, []);
		map.get(key)!.push(p);
	}
	return map;
}

function findBestStock(stock: StockItem[], minLength: number): StockItem | null {
	for (const s of stock) {
		if (s.length >= minLength) return s;
	}
	return stock[stock.length - 1] ?? null;
}

function findBestStock2D(stock: StockItem[], minLength: number, minWidth: number): StockItem | null {
	for (const s of stock) {
		if (s.length >= minLength && (s.width ?? 0) >= minWidth) return s;
	}
	return stock[stock.length - 1] ?? null;
}
