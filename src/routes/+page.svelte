<script lang="ts">
	import { FileDropzone, modeCurrent } from '@skeletonlabs/skeleton';

	// Local
	let files: FileList;

	function onChangeHandler(e: Event): void {
		console.log('file data:', e);
		console.log('files:', files);
	}

	$: trackUnderLineClass = $modeCurrent ? 'decoration-cyan-700' : 'decoration-yellow-300';
</script>

<div class="flex-auto w-full h-full flex overflow-hidden">
	<div id="page" class="flex-1 overflow-x-hidden flex flex-col" style="scrollbar-gutter: auto;">
		<main id="page-content" class="flex-auto">
			<div class="container h-full mx-auto flex justify-center mt-[10%]">
				<div class="w-full mx-12">
					<h1 class="text-5xl mb-12 mx-auto">
						Upload those <span class="underline {trackUnderLineClass} font-bold">tracks</span>.
					</h1>
					<FileDropzone
						class="h-[30rem]"
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
				</div>
			</div>
		</main>
	</div>
</div>

<style lang="postcss">
	figure {
		@apply flex relative flex-col;
	}
	figure svg,
	.img-bg {
		@apply w-64 h-64 md:w-80 md:h-80;
	}
	.img-bg {
		@apply absolute z-[-1] rounded-full blur-[50px] transition-all;
		animation:
			pulse 5s cubic-bezier(0, 0, 0, 0.5) infinite,
			glow 5s linear infinite;
	}
	@keyframes glow {
		0% {
			@apply bg-primary-400/50;
		}
		33% {
			@apply bg-secondary-400/50;
		}
		66% {
			@apply bg-tertiary-400/50;
		}
		100% {
			@apply bg-primary-400/50;
		}
	}
	@keyframes pulse {
		50% {
			transform: scale(1.5);
		}
	}
</style>
