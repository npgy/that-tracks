<script lang="ts">
	import filesStore, { imageStore, type AppFile } from '$lib/state/files.store';
	import { FileDropzone } from '@skeletonlabs/skeleton';

	export let fileInputEl: any;

	let droppedFiles: FileList | undefined;

	function onChangeHandler(e: Event): void {
		if (!droppedFiles) {
			return;
		}

		const droppedFilesFiltered = Array.from(droppedFiles).filter((file) => {
			if (file.type.includes('audio')) {
				return file;
			}
			if (file.type.includes('image')) {
				imageStore.set({
					uuid: window.crypto.randomUUID(),
					order: 0,
					blobUrl: URL.createObjectURL(file),
					nativeFile: file
				} as AppFile);
			}
		});

		const droppedFilteredAppFiles = droppedFilesFiltered.map((file, i) => {
			return {
				uuid: window.crypto.randomUUID(),
				order: file.type.includes('audio') ? i + $filesStore.length : 0,
				blobUrl: URL.createObjectURL(file),
				nativeFile: file
			} as AppFile;
		});

		filesStore.update((files) => [...files, ...droppedFilteredAppFiles]);
	}
</script>

<FileDropzone
	class={$filesStore?.length > 0 ? 'min-h-[4rem]' : 'h-[40vh]'}
	id="file-dropper"
	name="files-example-two"
	accept="image/*,audio/*"
	multiple
	on:change={onChangeHandler}
	bind:files={droppedFiles}
	bind:fileInput={fileInputEl}
>
	<svelte:fragment slot="lead">
		<i class="fa-solid fa-file-arrow-up text-4xl"></i>
	</svelte:fragment>
	<svelte:fragment slot="message">
		<div>
			<strong>Upload {$filesStore?.length > 0 ? 'more ' : ' '}files</strong> or drag and drop
		</div>
	</svelte:fragment>
	<svelte:fragment slot="meta">
		{#if $filesStore?.length === 0}
			<div class={$filesStore?.length > 0 ? 'pb-[1vh]' : ''}>Audio and Image formats allowed.</div>
		{/if}
	</svelte:fragment>
</FileDropzone>
