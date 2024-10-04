<script lang="ts">
	import filesStore from '$lib/state/files.store';

	export let fileInputEl: HTMLInputElement | undefined;

	function clearFiles(): void {
		(fileInputEl as any).value = '';
		filesStore.set([]);
	}
</script>

{#if $filesStore?.length > 0}
	<div class="w-full mt-8">
		<button class="btn variant-filled-primary mb-4" on:click={clearFiles}>Clear</button>
		<div class="flex flex-col">
			{#each $filesStore as file, i}
				<div
					class="flex flex-row space-x-4 p-4 mb-2 bg-gray-100 dark:bg-surface-700 border-token rounded-token border-surface-200 dark:border-surface-600"
					style="order: {i}}"
				>
					<i class="fa-solid fa-bars self-center hover:cursor-pointer"></i>
					<span class="flex-auto">
						<p class="text-md">{file.name}</p>
					</span>
				</div>
			{/each}
		</div>
	</div>
{/if}
