<script lang="ts">
	import filesStore from '$lib/state/files.store';
	import { onMount } from 'svelte';

	export let fileInputEl: any;

	let isMouseDown: boolean = false;
	let isReordering: Record<number, boolean> = { 0: false };
	let currentDraggingItem: number = -1;
	let currentDraggedPos: number = -1;
	let currentAbove: number = 0;
	let currentBelow: number = 1;

	function clearFiles(): void {
		console.log(fileInputEl);
		(fileInputEl as any).value = '';
		filesStore.set([]);
	}

	let offset: number;

	function beginReorder(item: number): (e: MouseEvent) => void {
		return (e: MouseEvent) => {
			e.preventDefault();
			isReordering[item] = true;
			isMouseDown = true;
			currentDraggingItem = item;
			currentDraggedPos = item;
			let draggableItem = document.getElementById(`draggable-file-${item}`);
			const docXPos = document.firstElementChild?.getBoundingClientRect().left ?? 0;
			const docYPos = document.firstElementChild?.getBoundingClientRect().top ?? 0;

			const xPos = draggableItem?.offsetLeft ?? 0;
			const yPos = draggableItem?.offsetTop ?? 0;
			offset = yPos - e.clientY;
			let draggablePlaceholder = document.getElementById('draggable-placeholder');
			draggablePlaceholder?.style.setProperty('order', (item + 1).toString());
			draggablePlaceholder?.classList.remove('hidden');
			draggableItem?.classList.add('absolute');
			draggableItem?.classList.add('w-[40rem]');
			draggableItem?.style.setProperty('left', xPos.toString() + 'px');
			draggableItem?.style.setProperty('top', yPos.toString() + 'px');

			// get current list items above and below
			currentAbove = item - 1;
			currentBelow = item + 1;
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
			currentDraggingItem = -1;
			currentDraggedPos = -1;
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

	function getAllDraggables(): HTMLElement[] {
		let draggables: HTMLElement[] = [];
		for (let i = 0; i < $filesStore.length; i++) {
			const draggableItem = document.getElementById(`draggable-file-${i}`);
			if (draggableItem) draggables.push(draggableItem);
		}
		return draggables;
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
					class="flex flex-row space-x-4 p-4 mb-2 h-[58px] bg-gray-100 dark:bg-surface-700 rounded-token hidden"
				></div>

				{#each $filesStore as file, i}
					<div
						id="draggable-file-{i}"
						data-file-num={i}
						class="flex flex-row space-x-4 p-4 mb-2 bg-gray-100 dark:bg-surface-700 border-token rounded-token border-surface-200 dark:border-surface-600"
						style="order: {i}"
						draggable="false"
					>
						<button aria-roledescription="Reorders the track" on:mousedown={beginReorder(i)}
							><i class="fa-solid fa-bars self-center hover:cursor-pointer"></i></button
						>
						<span class="flex-auto">
							<p class="text-md">{file.name}</p>
						</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}
