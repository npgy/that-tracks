<script lang="ts">
	import { FileDropzone } from '@skeletonlabs/skeleton';

	export let files: File[];

	let droppedFiles: FileList | undefined;

	function onChangeHandler(e: Event): void {
		if (!droppedFiles) {
			return;
		}

		const droppedFilesFiltered = Array.from(droppedFiles).filter((file) => {
			if (file.type.includes('audio') || file.type.includes('image')) {
				return file;
			}
		});

		files = [...files, ...droppedFilesFiltered];

		if (files?.length > 0) {
			document.querySelector('.dropzone-lead')?.remove();
		}
	}
</script>

<FileDropzone
	class={files?.length > 0 ? 'min-h-[4rem]' : 'h-[40vh]'}
	id="file-dropper"
	name="files-example-two"
	accept="image/*,audio/*"
	multiple
	on:change={onChangeHandler}
	bind:files={droppedFiles}
>
	<svelte:fragment slot="lead">
		<i class="fa-solid fa-file-arrow-up text-4xl"></i>
	</svelte:fragment>
	<svelte:fragment slot="message">
		<div>
			<strong>Upload {files?.length > 0 ? 'more ' : ' '}files</strong> or drag and drop
		</div>
	</svelte:fragment>
	<svelte:fragment slot="meta">
		{#if files?.length === 0}
			<div class={files?.length > 0 ? 'pb-[1vh]' : ''}>Audio and Image formats allowed.</div>
		{/if}
	</svelte:fragment>
</FileDropzone>
