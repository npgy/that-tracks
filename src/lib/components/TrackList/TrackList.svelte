<script lang="ts">
	import filesStore, { type AppFile } from '$lib/state/files.store';
	import { onDestroy, onMount } from 'svelte';

	export let fileInputEl: any;

	let isMouseDown: boolean = false;
	let isReordering: Record<number, boolean> = { 0: false };
	let currentDraggingItem: string = '';
	let currentDraggedPos: string = '';
	let currentAbove: string = '';
	let currentBelow: string = '';
	$: fileObjUrls = [''];
	$: totalRuntime = 0;

	function clearFiles(): void {
		console.log(fileInputEl);
		(fileInputEl as any).value = '';
		filesStore.set([]);
	}

	let offset: number;

	function beginReorder(file: AppFile): (e: MouseEvent) => void {
		return (e: MouseEvent) => {
			e.preventDefault();
			isReordering[file.order] = true;
			isMouseDown = true;
			currentDraggingItem = file.uuid;
			currentDraggedPos = file.uuid;
			let draggableItem = document.getElementById(`draggable-file-${file.uuid}`);
			const xPos = draggableItem?.offsetLeft ?? 0;
			const yPos = draggableItem?.offsetTop ?? 0;
			const draggableHeight = (draggableItem?.offsetHeight.toString() ?? '58') + 'px';
			offset = yPos - e.clientY;
			let draggablePlaceholder = document.getElementById('draggable-placeholder');
			draggablePlaceholder?.style.setProperty('order', (file.order + 1).toString());
			draggablePlaceholder?.style.setProperty('height', draggableHeight);
			draggablePlaceholder?.classList.remove('hidden');
			draggableItem?.classList.add('absolute');
			draggableItem?.classList.add('w-[40rem]');
			draggableItem?.style.setProperty('left', xPos.toString() + 'px');
			draggableItem?.style.setProperty('top', yPos.toString() + 'px');

			// get current list items above and below
			currentAbove = $filesStore[file.order - 1].uuid;
			currentBelow = $filesStore[file.order + 1].uuid;
		};
	}

	onMount(() => {
		let currentAboveEl = document.getElementById(`draggable-file-${currentAbove}`);
		let currentBelowEl = document.getElementById(`draggable-file-${currentBelow}`);

		document.addEventListener('mouseup', (e: MouseEvent) => {
			isMouseDown = false;
			let draggableItem = document.getElementById(`draggable-file-${currentDraggingItem}`);
			let draggablePlaceholder = document.getElementById('draggable-placeholder');
			draggablePlaceholder?.classList.add('hidden');

			if (currentDraggedPos === currentDraggingItem) {
				draggableItem?.style.setProperty('order', currentDraggedPos.toString());
			}

			draggableItem?.classList.remove('absolute');
			draggableItem?.style.removeProperty('left');
			draggableItem?.style.removeProperty('top');
			currentDraggingItem = '';
			currentDraggedPos = '';
		});

		document.addEventListener('mousemove', (e: MouseEvent) => {
			e.preventDefault();
			let draggableItem = document.getElementById(`draggable-file-${currentDraggingItem}`);
			const draggablePlaceholder = document.getElementById('draggable-placeholder');
			const draggables = getAllDraggables();
			const yPos = draggableItem?.getBoundingClientRect().top ?? 0;
			let isBelow = false;
			let isAbove = false;
			if (isMouseDown) {
				draggableItem?.style.setProperty('top', (e.clientY + offset).toString() + 'px');

				// if (currentBelowEl && e.clientY > currentBelowEl.offsetTop) {
				// 	if (!isBelow) {
				// 		currentBelowEl.style.setProperty('order', currentDraggedPos.toString());
				// 		currentAbove++;
				// 		currentBelow++;
				// 		currentDraggedPos++;
				// 		currentAboveEl = document.getElementById(`draggable-file-${currentAbove}`);
				// 		currentBelowEl = document.getElementById(`draggable-file-${currentBelow}`);
				// 		draggablePlaceholder?.style.setProperty('order', currentDraggedPos.toString());
				// 		isBelow = true;
				// 	}
				// }
				// if (currentAboveEl && e.clientY < currentAboveEl.offsetTop + currentAboveEl.offsetHeight) {
				// 	if (!isAbove) {
				// 		currentAboveEl.style.setProperty('order', currentDraggedPos.toString());
				// 		currentAbove--;
				// 		currentBelow--;
				// 		currentDraggedPos--;
				// 		currentAboveEl = document.getElementById(`draggable-file-${currentAbove}`);
				// 		currentBelowEl = document.getElementById(`draggable-file-${currentBelow}`);
				// 		draggablePlaceholder?.style.setProperty('order', currentDraggedPos.toString());
				// 		isAbove = true;
				// 	}
				// }
			}
		});
	});

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
						draggable="false"
					>
						<button aria-roledescription="Reorders the track" on:mousedown={beginReorder(file)}
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
