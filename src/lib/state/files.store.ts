import { writable, type Updater, type Writable } from 'svelte/store';

export type AppFile = {
	uuid: string;
	blobUrl?: string;
	order: number;
	nativeFile: File;
};

function createFilesStore(): Writable<AppFile[]> {
	const { set, update, subscribe }: Writable<AppFile[]> = writable([]);

	function setFiles(files: AppFile[]) {
		set(files);
		updateSvelteFragmentInTheDom(files);
	}

	function updateFiles(updater: Updater<AppFile[]>): void {
		update((files) => {
			const updatedFiles = updater(files);
			updateSvelteFragmentInTheDom(updatedFiles);
			return updatedFiles;
		});
	}

	return {
		set: setFiles,
		update: updateFiles,
		subscribe
	};
}

// Should be able to remove this in version 5
function updateSvelteFragmentInTheDom(files: AppFile[]): void {
	if (files?.length > 0) {
		document.querySelector('.dropzone-lead')?.setAttribute('hidden', 'true');
	} else {
		document.querySelector('.dropzone-lead')?.removeAttribute('hidden');
	}
}

const filesStore = createFilesStore();

export default filesStore;
