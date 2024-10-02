import { writable, type Updater, type Writable } from 'svelte/store';

function createFilesStore(): Writable<File[]> {
	const { set, update, subscribe }: Writable<File[]> = writable([]);

	function setFiles(files: File[]) {
		set(files);
		updateSvelteFragmentInTheDom(files);
	}

	function updateFiles(updater: Updater<File[]>): void {
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
function updateSvelteFragmentInTheDom(files: File[]): void {
	if (files?.length > 0) {
		document.querySelector('.dropzone-lead')?.setAttribute('hidden', 'true');
	} else {
		document.querySelector('.dropzone-lead')?.removeAttribute('hidden');
	}
}

const filesStore = createFilesStore();

export default filesStore;
