<script lang="ts">
	import filesStore from '$lib/state/files.store';
	import { onMount } from 'svelte';

	export let fileInputEl: any;

	let isMouseDown: boolean = false;
	let isReordering: Record<number, boolean> = { 0: false };
	let currentDraggingItem: number = -1;

	function clearFiles(): void {
		console.log(fileInputEl);
		(fileInputEl as any).value = '';
		filesStore.set([]);
	}

	let offset: number[];

	function beginReorder(item: number): (e: MouseEvent) => void {
		return (e: MouseEvent) => {
			e.preventDefault();
			isReordering[item] = true;
			isMouseDown = true;
			currentDraggingItem = item;
			console.log(isReordering);
			let draggableItem = document.getElementById(`draggable-file-${item}`);
			const docXPos = document.firstElementChild?.getBoundingClientRect().left ?? 0;
			const docYPos = document.firstElementChild?.getBoundingClientRect().top ?? 0;
			// console.log(docXPos, docYPos);

			const xPos = draggableItem?.offsetLeft ?? 0;
			const yPos = draggableItem?.offsetTop ?? 0;
			offset = [xPos - e.clientX, yPos - e.clientY];
			let draggablePlaceholder = document.getElementById('draggable-placeholder');
			draggablePlaceholder?.classList.remove('hidden');
			draggableItem?.classList.add('absolute');
			draggableItem?.classList.add('w-[40rem]');
			draggableItem?.style.setProperty('left', xPos.toString() + 'px');
			draggableItem?.style.setProperty('top', yPos.toString() + 'px');
			// console.log('beginning reorder', item);
		};
	}

	function duringReorder(item: number): (e: MouseEvent) => void {
		return (e: MouseEvent) => {
			e.preventDefault();
			let draggableItem = document.getElementById(`draggable-file-${item}`);
			const yPos = draggableItem?.getBoundingClientRect().top ?? 0;
			if (isReordering[item]) {
				// console.log(yPos, e.clientY);
				// console.log(offset);
				draggableItem?.style.setProperty('left', (e.clientX + offset[0]).toString() + 'px');
				draggableItem?.style.setProperty('top', (e.clientY + offset[1]).toString() + 'px');
				// console.log(e.clientX, e.clientY);
				// console.log(e.clientX, e.clientY);
			}
		};
	}

	function endReorder(item: number): (e: MouseEvent) => void {
		return (e: MouseEvent) => {
			e.preventDefault();
			isReordering[item] = false;
			isMouseDown = false;
			currentDraggingItem = -1;
			let draggableItem = document.getElementById(`draggable-file-${item}`);
			let draggablePlaceholder = document.getElementById('draggable-placeholder');
			draggablePlaceholder?.classList.add('hidden');
			draggableItem?.classList.remove('absolute');
			draggableItem?.style.removeProperty('left');
			draggableItem?.style.removeProperty('top');
			// console.log('ending reorder', item);
		};
	}

	onMount(() => {
		document.addEventListener('mouseup', (e: MouseEvent) => {
			isMouseDown = false;
			let draggableItem = document.getElementById(`draggable-file-${currentDraggingItem}`);
			let draggablePlaceholder = document.getElementById('draggable-placeholder');
			draggablePlaceholder?.classList.add('hidden');
			draggableItem?.classList.remove('absolute');
			draggableItem?.style.removeProperty('left');
			draggableItem?.style.removeProperty('top');
			currentDraggingItem = -1;
		});

		document.addEventListener('mousemove', (e: MouseEvent) => {
			e.preventDefault();
			let draggableItem = document.getElementById(`draggable-file-${currentDraggingItem}`);
			const yPos = draggableItem?.getBoundingClientRect().top ?? 0;
			if (isMouseDown) {
				// console.log(yPos, e.clientY);
				// console.log(offset);
				// draggableItem?.style.setProperty('left', (e.clientX + offset[0]).toString() + 'px');
				draggableItem?.style.setProperty('top', (e.clientY + offset[1]).toString() + 'px');
				// console.log(e.clientX, e.clientY);
				// console.log(e.clientX, e.clientY);
			}
		});
	});
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
		<div class="flex flex-col w-[40rem] mx-auto">
			<button class="btn variant-filled-primary mb-4" on:click={clearFiles}>Clear</button>
			<div
				id="draggable-placeholder"
				class="flex flex-row space-x-4 p-4 mb-2 h-[58px] bg-gray-100 dark:bg-surface-700 rounded-token hidden"
			></div>

			{#each $filesStore as file, i}
				<div
					id="draggable-file-{i}"
					class="flex flex-row space-x-4 p-4 mb-2 bg-gray-100 dark:bg-surface-700 border-token rounded-token border-surface-200 dark:border-surface-600"
					style="order: {i}}"
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
{/if}
