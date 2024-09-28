<script lang="ts">
	import { FileDropzone, modeCurrent } from '@skeletonlabs/skeleton';

	// Local
	let files: FileList;

	let imgUrl: string;

	function onChangeHandler(e: Event): void {
		console.log('file data:', e);
		console.log('files:', files);
	}

	function download(): void {
		const fileUrl = URL.createObjectURL(files[0]);

		imgUrl = fileUrl;
		let a = document.createElement('a');
		document.body.appendChild(a);
		a.setAttribute('style', 'display: none');

		a.href = fileUrl;
		a.download = 'blobby.jpg';
		a.click();
		window.URL.revokeObjectURL(fileUrl);
	}

	$: trackUnderLineClass = $modeCurrent ? 'decoration-cyan-700' : 'decoration-yellow-300';
</script>

<div class="flex-auto w-full h-full flex overflow-hidden">
	<div id="page" class="flex-1 overflow-x-hidden flex flex-col" style="scrollbar-gutter: auto;">
		<main id="page-content" class="flex-auto mt-[10vh]">
			<div class="container h-full mx-auto flex justify-center">
				<div class="w-full mx-12">
					<h1 class="text-5xl mb-12 mx-auto">
						Upload those <span class="underline {trackUnderLineClass} font-bold">tracks</span>.
					</h1>
					<FileDropzone
						class="h-[40vh]"
						name="files-example-two"
						accept="image/*"
						on:change={onChangeHandler}
						bind:files
					>
						<svelte:fragment slot="lead"
							><i class="fa-solid fa-file-arrow-up text-4xl"></i></svelte:fragment
						>
						<svelte:fragment slot="meta">MP3, WAV, JPG, PNG allowed.</svelte:fragment>
					</FileDropzone>
					<br />
					<!-- <button class="btn variant-filled-primary" on:click={download}>Download</button> -->
					<!-- <img src={imgUrl} /> -->
				</div>
			</div>
		</main>
	</div>
</div>
