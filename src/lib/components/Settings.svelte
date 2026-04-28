<script lang="ts">
	import type { ProjectSettings } from '$lib/types';
	import { getCurrentProject, updateSettings } from '$lib/stores/project.svelte';

	const project = $derived(getCurrentProject());
	const settings = $derived(project?.settings);

	function setUnits(e: Event) {
		updateSettings({ units: (e.target as HTMLSelectElement).value as ProjectSettings['units'] });
	}

	function setKerf(e: Event) {
		const val = parseFloat((e.target as HTMLInputElement).value);
		if (!isNaN(val) && val >= 0) updateSettings({ kerfWidth: val });
	}

	function setRotation(e: Event) {
		updateSettings({ allowRotation: (e.target as HTMLInputElement).checked });
	}
</script>

{#if settings}
	<div class="flex flex-wrap items-center gap-4 text-sm">
		<div class="flex items-center gap-1">
			<label class="text-gray-500">Units:</label>
			<select value={settings.units} onchange={setUnits} class="border rounded px-2 py-1 bg-white text-sm">
				<option value="in">Inches</option>
				<option value="mm">Millimeters</option>
				<option value="cm">Centimeters</option>
			</select>
		</div>

		<div class="flex items-center gap-1">
			<label class="text-gray-500">Kerf:</label>
			<input
				type="number"
				value={settings.kerfWidth}
				onchange={setKerf}
				step="0.01"
				min="0"
				class="border rounded px-2 py-1 w-20 text-sm"
			/>
			<span class="text-gray-400">{settings.units}</span>
		</div>

		<label class="flex items-center gap-1 cursor-pointer">
			<input type="checkbox" checked={settings.allowRotation} onchange={setRotation} class="rounded" />
			<span class="text-gray-500">Allow rotation (2D)</span>
		</label>
	</div>
{/if}
