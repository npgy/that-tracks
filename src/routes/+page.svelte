<script lang="ts">
	import { FileDropzone, ProgressBar, modeCurrent } from '@skeletonlabs/skeleton';
	import { FFmpeg } from '@ffmpeg/ffmpeg';
	import type { FileData, LogEvent } from '../../node_modules/@ffmpeg/ffmpeg/dist/esm/types.d.ts';
	import { fetchFile } from '../../node_modules/@ffmpeg/util/dist/esm/index.js';
	import ffmpegCore from '@ffmpeg/core?url';
	import { page } from '$app/stores';
	import { toBlobURL } from '@ffmpeg/util';
	// import { createFFmpegCore } from '../../node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js';

	// Local
	let droppedFiles: FileList | undefined;
	let fileDropperEl;
	let files: File[] = [];

	let fileUrls: { [file: string]: string } = { aud0: 'fileurl' };
	let audCount = 0;

	let vidOutput: FileData;

	let encodeProgress: number = 0;
	let encodeStarted: boolean = false;
	let encodeDone: boolean = false;

	let hasAudioFiles: boolean = false;
	let hasMultipleAudioFiles: boolean = false;
	let hasImageFile: boolean = false;
	let hasRequiredFiles: boolean = false;

	let ffmpegAudParams: string[] = [];
	let ffmpegConcatParams: string[] = [];

	function onChangeHandler(e: Event): void {
		if (!droppedFiles) {
			return;
		}

		const droppedFilesFiltered = Array.from(droppedFiles).filter((file) => {
			if (file.type.includes('image') && !hasImageFile) {
				hasImageFile = true;

				return file;
			}
			if (file.type.includes('audio')) {
				hasAudioFiles = true;

				return file;
			}
		});

		files = [...files, ...droppedFilesFiltered];

		audCount = 0;
		ffmpegAudParams = [];
		ffmpegConcatParams = ['[1:a]'];
		for (const file of files) {
			if (file.type.includes('audio')) {
				hasMultipleAudioFiles = audCount > 0;

				fileUrls['aud' + audCount] = URL.createObjectURL(file);

				if (hasMultipleAudioFiles) {
					ffmpegAudParams = [...ffmpegAudParams, '-i', 'aud' + audCount];
					ffmpegConcatParams = [...ffmpegConcatParams, `[${audCount + 1}:a]`];
				}
				audCount++;
			}
			if (file.type.includes('image')) {
				fileUrls['cover'] = URL.createObjectURL(file);
			}
		}

		console.log('file data:', e);
		console.log('files:', files);

		hasRequiredFiles = hasAudioFiles && hasImageFile;
	}

	function clearFiles(): void {
		files = [];
		fileDropperEl = document.getElementById('file-dropper') as any;
		fileDropperEl.value = '';
		audCount = 0;
		hasImageFile = false;
		hasAudioFiles = false;
		hasRequiredFiles = false;
	}

	async function ffmpegStuff(): Promise<void> {
		if (!hasRequiredFiles) {
			return;
		}

		encodeStarted = true;
		console.log('starting ffmpeg stuff');

		const ffmpeg = new FFmpeg();
		ffmpeg.on('log', ({ message: msg }: LogEvent) => {
			console.log(msg);
		});

		ffmpeg.on('progress', (pe) => {
			encodeProgress = pe.progress;
			if (pe.progress === 1) {
				encodeDone = true;
			}

			console.log(pe);
		});

		console.log('about to load');
		await ffmpeg.load({
			coreURL: ffmpegCore,
			wasmURL: await toBlobURL(`${$page.url.origin}/ffmpeg-core.wasm`, 'application/wasm')
		});
		console.log('loaded ffmpeg');

		console.log(fileUrls);
		for (const fileName in fileUrls) {
			await ffmpeg.writeFile(fileName, await fetchFile(fileUrls[fileName]));
		}

		console.log('writing input file');
		console.log(ffmpegAudParams);
		console.log(ffmpegConcatParams);

		let concatParams: string[] = [];
		if (hasMultipleAudioFiles) {
			concatParams = [
				...ffmpegAudParams,
				'-filter_complex',
				ffmpegConcatParams.join('') + 'concat=n=' + ffmpegConcatParams.length + ':v=0:a=1'
			];
			console.log(concatParams);
		}

		await ffmpeg.exec([
			'-hwaccel',
			'auto',
			'-loop',
			'1',
			'-framerate',
			'1',
			'-i',
			'cover',
			'-i',
			'aud0',
			...concatParams,
			'-tune',
			'stillimage',
			'-shortest',
			'-fflags',
			'+shortest',
			'-max_interleave_delta',
			'100M',
			'-vf',
			'format=yuv420p',
			'-s',
			'1080x1080',
			'-preset',
			'ultrafast',
			'-b:a',
			'320k',
			'out.mp4'
		]);
		// await ffmpeg.exec(['-i', 'in.mp4', '-c:a', 'copy', 'out.mp4']);
		console.log('encoding to mp4');

		vidOutput = await ffmpeg.readFile('out.mp4');

		// await ffmpeg.writeFile('in.mp4', vidOutput);
	}

	function download(): void {
		const vidUrl = URL.createObjectURL(
			new Blob([(vidOutput as Uint8Array).buffer], { type: 'video/mp4' })
		);

		let a = document.createElement('a');
		document.body.appendChild(a);
		a.setAttribute('style', 'display: none');

		a.href = vidUrl;
		a.download = 'out.mp4';
		a.click();
		window.URL.revokeObjectURL(vidUrl);
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
						class={files?.length > 0 ? 'min-h-[8rem]' : 'h-[40vh]'}
						id="file-dropper"
						name="files-example-two"
						accept="image/*,audio/*"
						multiple
						on:change={onChangeHandler}
						bind:files={droppedFiles}
					>
						<svelte:fragment slot="lead">
							{#if !files || files?.length == 0}
								<i class="fa-solid fa-file-arrow-up text-4xl"></i>
							{/if}
						</svelte:fragment>
						<svelte:fragment slot="message">
							<div class={files?.length > 0 ? 'pt-[1vh]' : ''}>
								<strong>Upload {files?.length > 0 ? 'more ' : ' '}files</strong> or drag and drop
							</div>
						</svelte:fragment>
						<svelte:fragment slot="meta"
							><div class={files?.length > 0 ? 'pb-[1vh]' : ''}>
								Audio and Image formats allowed.
							</div></svelte:fragment
						>
					</FileDropzone>
					<br />

					<ProgressBar value={encodeProgress} max={1} />

					{#if files?.length > 0}
						<div class="w-full mt-8">
							<button class="btn variant-filled-primary mb-4" on:click={clearFiles}>Clear</button>
							<dl class="list-dl">
								{#each files as file}
									<div>
										<span class="badge bg-primary-500">📄</span>
										<span class="flex-auto">
											<dt>{file.name}</dt>
											<dd>
												{file.type.includes('audio')
													? 'An audio file'
													: file.type.includes('image')
														? 'An image file'
														: 'An unknown file'}
											</dd>
										</span>
									</div>
								{/each}
								<!-- ... -->
							</dl>
						</div>
					{/if}

					<div class="flex flex-col items-center justify-center mt-12">
						<button
							disabled={!hasRequiredFiles}
							class="btn variant-filled-primary mb-4 w-80 font-bold disabled"
							on:click={ffmpegStuff}>Create Video</button
						>

						<!-- {#if encodeStarted} -->
						<!-- {/if} -->
						<br />

						{#if encodeDone}
							<p class="mb-2">Your video is ready!</p>
							<button class="btn variant-filled-primary font-bold" on:click={download}
								>Download</button
							>
						{/if}
					</div>
					<!-- <img src={imgUrl} /> -->
				</div>
			</div>
		</main>
	</div>
</div>
