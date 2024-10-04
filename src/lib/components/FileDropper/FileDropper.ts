import filesStore from '$lib/state/files.store';

export function hasRequiredFiles(files: File[]): boolean {
	let hasAudio: boolean = false;
	let hasImage: boolean = false;
	for (const file of files) {
		if (file.type.includes('image')) {
			hasImage = true;
		}
		if (file.type.includes('audio')) {
			hasAudio = true;
		}
		if (hasAudio && hasImage) {
			return true;
		}
	}
	return false;
}
