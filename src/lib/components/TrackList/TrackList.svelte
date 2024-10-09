<script lang="ts">
	import filesStore, { type AppFile } from '$lib/state/files.store';
	import { onDestroy, onMount } from 'svelte';

	export let fileInputEl: any;

	let currentDraggable: HTMLElement | null;
	let currentDraggingFile: AppFile | undefined;
	$: fileObjUrls = [''];

	function clearFiles(): void {
		console.log(fileInputEl);
		(fileInputEl as any).value = '';
		filesStore.set([]);
	}

	onDestroy(() => {
		revokeFileObjURLs();
	});

	function createFileObjURLs(): void {
		let i = 0;
		fileObjUrls = [];
		for (const file of $filesStore) {
			fileObjUrls[i] = URL.createObjectURL(file.nativeFile);
			i++;
		}
	}

	function revokeFileObjURLs(): void {
		if (fileObjUrls) fileObjUrls.forEach((url) => URL.revokeObjectURL(url));
	}

	filesStore.subscribe(() => {
		revokeFileObjURLs();
		createFileObjURLs();
	});

	function deleteFile(fileId: string): () => void {
		return () => {
			const filtered = $filesStore.filter((file) => {
				return file.uuid !== fileId;
			});
			filesStore.set(filtered);
			if (filtered.length === 0) {
				clearFiles();
			}
		};
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
		if (!dragOverEl.id.startsWith('draggable-file-')) {
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

{#if $filesStore?.length > 0}
	<div class="w-full mt-8">
		<div class="w-[40rem] mx-auto">
			<button class="btn variant-filled-primary mb-4" on:click={clearFiles}>Clear</button>
			<div class="flex flex-col">
				{#each $filesStore as file, _}
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
						<span class="flex-auto self-center">
							<p class="text-md">{file.nativeFile.name}</p>
						</span>
						{#if file.nativeFile.type.includes('audio')}
							<audio data-aud-uuid={file.uuid} controls src={fileObjUrls[file.order]}></audio>
						{/if}
						<button on:click={deleteFile(file.uuid)} aria-roledescription="Deletes the track"
							><i class="fa-solid fa-trash"></i></button
						>
					</div>
				{/each}
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
