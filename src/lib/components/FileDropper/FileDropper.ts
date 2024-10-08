import { type AppFile } from '$lib/state/files.store';

export function hasRequiredFiles(files: AppFile[]): boolean {
	let hasAudio: boolean = false;
	let hasImage: boolean = false;
	for (const file of files) {
		if (file?.nativeFile?.type.includes('image')) {
			hasImage = true;
		}
		if (file?.nativeFile?.type.includes('audio')) {
			hasAudio = true;
		}
		if (hasAudio && hasImage) {
			return true;
		}
	}
	return false;
}
