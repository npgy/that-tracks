<script lang="ts">
	import filesStore, { type AppFile } from '$lib/state/files.store';
	import { onDestroy, onMount } from 'svelte';

	export let fileInputEl: any;

	let isMouseDown: boolean = false;
	let isReordering: Record<number, boolean> = { 0: false };
	let currentDraggingItem: AppFile | undefined;
	let currentDraggedPos: number = -1;
	let currentAbove: string = '';
	let currentBelow: string = '';
	let currentAboveEl: HTMLElement | null;
	let currentBelowEl: HTMLElement | null;
	$: fileObjUrls = [''];
	$: totalRuntime = 0;

	function clearFiles(): void {
		console.log(fileInputEl);
		(fileInputEl as any).value = '';
		filesStore.set([]);
	}

	let offset: number;

	// function beginReorder(file: AppFile): (e: MouseEvent) => void {
	// 	return (e: MouseEvent) => {
	// 		e.preventDefault();
	// 		isReordering[file.order] = true;
	// 		isMouseDown = true;
	// 		currentDraggingItem = file;
	// 		currentDraggedPos = file.order;
	// 		let draggableItem = document.getElementById(`draggable-file-${file.uuid}`);
	// 		const xPos = draggableItem?.offsetLeft ?? 0;
	// 		const yPos = draggableItem?.offsetTop ?? 0;
	// 		const draggableHeight = (draggableItem?.offsetHeight.toString() ?? '58') + 'px';
	// 		offset = yPos - e.clientY;
	// 		let draggablePlaceholder = document.getElementById('draggable-placeholder');
	// 		draggablePlaceholder?.style.setProperty('order', (file.order + 1).toString());
	// 		draggablePlaceholder?.style.setProperty('height', draggableHeight);
	// 		draggablePlaceholder?.classList.remove('hidden');
	// 		draggableItem?.classList.add('absolute');
	// 		draggableItem?.classList.add('w-[40rem]');
	// 		draggableItem?.style.setProperty('left', xPos.toString() + 'px');
	// 		draggableItem?.style.setProperty('top', yPos.toString() + 'px');

	// 		// get current list items above and below
	// 		if (file.order > 0) {
	// 			currentAbove = $filesStore[file.order - 1].uuid;
	// 		}
	// 		if (file.order < $filesStore.length - 1) {
	// 			currentBelow = $filesStore[file.order + 1].uuid;
	// 		}
	// 	};
	// }

	function getAboveEl(fileUuid: string): HTMLElement | null {
		const itemOrder = $filesStore.find((file) => file.uuid === fileUuid)?.order ?? 0;
		const prevUuid = $filesStore.find((file) => file.order === itemOrder - 1)?.uuid ?? '';
		return document.getElementById(`draggable-file-${prevUuid}`);
	}

	function getBelowEl(fileUuid: string): HTMLElement | null {
		const itemOrder = $filesStore.find((file) => file.uuid === fileUuid)?.order ?? 0;
		const prevUuid = $filesStore.find((file) => file.order === itemOrder + 1)?.uuid ?? '';
		return document.getElementById(`draggable-file-${prevUuid}`);
	}

	// onMount(() => {
	// 	if (currentDraggingItem) {
	// 		currentAboveEl = getAboveEl(currentDraggingItem.uuid);
	// 		currentBelowEl = getBelowEl(currentDraggingItem.uuid);
	// 	}

	// document.addEventListener('mouseup', (e: MouseEvent) => {
	// 	if (!currentDraggingItem) {
	// 		return;
	// 	}
	// 	isMouseDown = false;
	// 	let draggableItem = document.getElementById(`draggable-file-${currentDraggingItem.uuid}`);
	// 	let draggablePlaceholder = document.getElementById('draggable-placeholder');
	// 	draggablePlaceholder?.classList.add('hidden');

	// 	if (currentDraggedPos === currentDraggingItem?.order) {
	// 		draggableItem?.style.setProperty('order', currentDraggedPos.toString());
	// 	}

	// 	draggableItem?.classList.remove('absolute');
	// 	draggableItem?.style.removeProperty('left');
	// 	draggableItem?.style.removeProperty('top');
	// 	currentDraggingItem = undefined;
	// 	currentDraggedPos = -1;
	// });

	// document.addEventListener('mousemove', (e: MouseEvent) => {
	// 	e.preventDefault();
	// 	if (!currentDraggingItem) {
	// 		return;
	// 	}
	// 	let draggableItem = document.getElementById(`draggable-file-${currentDraggingItem?.uuid}`);
	// 	const draggablePlaceholder = document.getElementById('draggable-placeholder');
	// 	currentAboveEl = getAboveEl(currentDraggingItem.uuid);
	// 	currentBelowEl = getBelowEl(currentDraggingItem.uuid);
	// 	const draggables = getAllDraggables();
	// 	const yPos = draggableItem?.getBoundingClientRect().top ?? 0;
	// 	let isBelow = false;
	// 	let isAbove = false;
	// 	if (isMouseDown) {
	// 		draggableItem?.style.setProperty('top', (e.clientY + offset).toString() + 'px');
	// 		// console.log(currentDraggingItem);
	// 		// console.log('above', currentAboveEl);
	// 		// console.log('below', currentBelowEl);
	// 		if (currentBelowEl && e.clientY > currentBelowEl.offsetTop) {
	// 			console.log('moved down 1');
	// 			currentBelowEl.style.setProperty('order', currentDraggedPos.toString());
	// 			currentDraggingItem.order++;
	// 			currentDraggedPos++;
	// 			currentAboveEl = getAboveEl(currentDraggingItem.uuid);
	// 			currentBelowEl = getBelowEl(currentDraggingItem.uuid);
	// 			draggablePlaceholder?.style.setProperty('order', currentDraggedPos.toString());
	// 			isBelow = true;
	// 			return;
	// 		}
	// 		if (currentAboveEl && e.clientY < currentAboveEl.offsetTop + currentAboveEl.offsetHeight) {
	// 			console.log('moved up 1');
	// 			currentAboveEl.style.setProperty('order', currentDraggedPos.toString());
	// 			currentDraggingItem.order--;
	// 			currentDraggedPos--;
	// 			currentAboveEl = getAboveEl(currentDraggingItem.uuid);
	// 			currentBelowEl = getBelowEl(currentDraggingItem.uuid);
	// 			draggablePlaceholder?.style.setProperty('order', currentDraggedPos.toString());
	// 			isAbove = true;
	// 			return;
	// 		}
	// 	}
	// });
	// });

	onDestroy(() => {
		revokeFileObjURLs();
	});

	function getAllDraggables(): HTMLElement[] {
		let draggables: HTMLElement[] = [];
		for (let i = 0; i < $filesStore.length; i++) {
			const draggableItem = document.getElementById(`draggable-file-${i}`);
			if (draggableItem) draggables.push(draggableItem);
		}
		return draggables;
	}

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

	function beginDrag(fileUuid: string): (e: DragEvent) => void {
		return (e: DragEvent) => {
			const draggable = document.getElementById(`draggable-file-${fileUuid}`);
			draggable?.setAttribute('draggable', 'true');
		};
	}

	function duringDrag(fileUuid: string): () => void {
		return () => {
			const draggable = document.getElementById(`draggable-file-${fileUuid}`);
			draggable?.style.setProperty('opacity', '0');
		};
	}

	function endDrag(fileUuid: string): (e: DragEvent) => void {
		return (e: DragEvent) => {
			e.preventDefault();
			const draggable = document.getElementById(`draggable-file-${fileUuid}`);
			draggable?.style.removeProperty('opacity');
			draggable?.setAttribute('draggable', 'false');
		};
	}

	function dragOver(e: DragEvent) {
		e.preventDefault();
	}
</script>

<!-- <div
	id="draggable-file-0"
	class="flex flex-row space-x-4 p-4 mb-2 h-[58px] bg-black w-[300px]"
	on:mousemove={duringReorder(0)}
	on:mousedown={beginReorder(0)}
	on:mouseup={endReorder(0)}
>
	 <button
		aria-roledescription="Reorders the track"
		><i class="fa-solid fa-bars self-center hover:cursor-pointer"></i></button
	> 
</div> -->

{#if $filesStore?.length > 0}
	<div class="w-full mt-8">
		<div class="w-[40rem] mx-auto">
			<button class="btn variant-filled-primary mb-4" on:click={clearFiles}>Clear</button>
			<div class="flex flex-col">
				<div
					id="draggable-placeholder"
					class="flex flex-row space-x-4 p-4 mb-2 bg-gray-100 dark:bg-surface-700 rounded-token hidden"
				></div>

				{#each $filesStore as file, _}
					<div
						id="draggable-file-{file.uuid}"
						data-file-num={file.uuid}
						class="flex flex-row space-x-4 p-4 mb-2 bg-gray-100 dark:bg-surface-700 border-token rounded-token border-surface-200 dark:border-surface-600"
						style="order: {file.order}"
						draggable={isReordering[file.order]}
						on:dragend={endDrag(file.uuid)}
						on:drag={duringDrag(file.uuid)}
						on:dragover={dragOver}
					>
						<button aria-roledescription="Reorders the track" on:mousedown={beginDrag(file.uuid)}
							><i class="fa-solid fa-bars self-center hover:cursor-pointer"></i></button
						>
						<span class="flex-auto self-center">
							<p class="text-md">{file.nativeFile.name}</p>
						</span>
						<audio id="audfile-{file.uuid}" controls src={fileObjUrls[file.order]}></audio>
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
