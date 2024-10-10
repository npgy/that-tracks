<script lang="ts">
	import filesStore, { imageStore, type AppFile } from '$lib/state/files.store';

	export let fileInputEl: any;

	let currentDraggable: HTMLElement | null;
	let currentDraggingFile: AppFile | undefined;
	let imageBlob: string;

	$: artworkFile = $filesStore.find((file) => file.nativeFile.type.includes('image'));

	function clearFiles(): void {
		filesStore.set([]);
	}

	function deleteFile(fileId: string): () => void {
		return () => {
			let numDeleted: number = -1;
			const filtered = $filesStore.filter((file) => {
				if (file.uuid === fileId) {
					URL.revokeObjectURL(file.blobUrl ?? '');
					numDeleted = file.order;
				}
				return file.uuid !== fileId;
			});

			const sorted = filtered.sort((a, b) => a.order - b.order);

			let newOrder = 0;
			const newFiles = sorted.map((file) => {
				let newFile = file;
				newFile.order = newOrder;
				newOrder++;
				return newFile;
			});

			filesStore.set(newFiles);

			(fileInputEl as any).value = '';
			if (filtered.length === 0) {
				clearFiles();
			}
		};
	}

	function deleteImage(): void {
		imageStore.set({} as AppFile);
	}

	function beginDrag(fileUuid: string): () => void {
		return () => {
			currentDraggingFile = $filesStore.find((file) => file.uuid === fileUuid);
			currentDraggable = document.getElementById(`draggable-file-${fileUuid}`);
			currentDraggable?.setAttribute('draggable', 'true');
		};
	}

	function duringDrag(): void {
		currentDraggable?.style.setProperty('opacity', '0');
	}

	function endDrag(e: DragEvent): void {
		e.preventDefault();
		currentDraggable?.style.removeProperty('opacity');
		currentDraggable?.setAttribute('draggable', 'false');
	}

	function dragOver(e: DragEvent) {
		e.preventDefault();
		let dragOverEl: HTMLElement = e.target as HTMLElement;
		if (!dragOverEl.id.startsWith('draggable-file-') || e.dataTransfer?.types.includes('Files')) {
			return;
		}
		let dragOverFile = $filesStore.find(
			(file) => file.uuid === dragOverEl.getAttribute('data-file-uuid')
		);
		if (currentDraggingFile?.uuid !== dragOverFile?.uuid) {
			const currentDraggableOrder = currentDraggable?.style.getPropertyValue('order') ?? '0';
			const dragOverFileOrder = dragOverEl.style.getPropertyValue('order');
			currentDraggable?.style.setProperty('order', dragOverEl.style.getPropertyValue('order'));
			dragOverEl?.style.setProperty('order', currentDraggableOrder);

			filesStore.update((files) => {
				const newFiles = files.map((file) => {
					let newFile = file;
					if (file.uuid === currentDraggingFile?.uuid) {
						newFile.order = Number(dragOverFileOrder);
					}
					if (file.uuid === dragOverFile?.uuid) {
						newFile.order = Number(currentDraggableOrder);
					}
					return newFile;
				});
				return newFiles;
			});
		}
	}
</script>

{#if $filesStore?.length > 0 || $imageStore?.nativeFile}
	<div class="w-full mt-8">
		<div class="w-[40rem] mx-auto">
			<button class="btn variant-filled-primary mb-4" on:click={clearFiles}>Clear All Files</button>
			<div class="flex flex-col">
				{#each $filesStore as file, _}
					{#if file.nativeFile.type.includes('audio')}
						<div
							id="draggable-file-{file.uuid}"
							data-file-uuid={file.uuid}
							class="flex flex-row space-x-4 p-4 mb-2 bg-gray-100 dark:bg-surface-700 border-token rounded-token border-surface-200 dark:border-surface-600"
							style="order: {file.order}"
							on:dragend={endDrag}
							on:drag={duringDrag}
							on:dragover={dragOver}
							aria-roledescription="Draggable file"
						>
							<button aria-roledescription="Reorders the track" on:mousedown={beginDrag(file.uuid)}
								><i class="fa-solid fa-bars self-center hover:cursor-pointer"></i></button
							>
							<span class="px-1 font-bold self-center">{file.order + 1}</span>
							<span class="flex-auto self-center">
								<p class="text-md">{file.nativeFile.name}</p>
							</span>
							<audio data-aud-uuid={file.uuid} controls src={file.blobUrl}></audio>
							<button on:click={deleteFile(file.uuid)} aria-roledescription="Deletes the track"
								><i class="fa-solid fa-trash"></i></button
							>
						</div>
					{/if}
				{/each}
				{#if $imageStore?.nativeFile}
					<h2 class="text-xl font-bold mb-4 mt-6" style="order: {$filesStore.length - 1}">
						Cover Art:
					</h2>
					<div
						class="flex flex-row flex-wrap space-x-4 p-4 mb-2 bg-gray-100 dark:bg-surface-700 border-token rounded-token border-surface-200 dark:border-surface-600"
						style="order: {$filesStore.length}"
						aria-roledescription="Draggable file"
					>
						<span class="flex-auto self-center">
							<p class="text-md">{$imageStore.nativeFile.name}</p>
						</span>
						<button on:click={deleteImage} aria-roledescription="Deletes the cover art"
							><i class="fa-solid fa-trash"></i></button
						>
						<img class="mt-12 w-[570px] h-auto" alt="cover artwork" src={$imageStore.blobUrl} />
					</div>
				{/if}
			</div>
			<!-- <div>
				<p>Total Runtime Minutes: {totalRuntime / 60}</p>
				on:loadedmetadata={(e) => {
								totalRuntime += e.currentTarget.duration;
							}}
			</div> -->
		</div>
	</div>
{/if}
