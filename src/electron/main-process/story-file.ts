import {app, dialog, shell} from 'electron';
import {
	mkdtemp,
	move,
	readdir,
	readFile,
	rename,
	stat,
	writeFile,
	pathExists
} from 'fs-extra';
import path, {basename, join} from 'path';
import {i18n} from './locales';
import {storyDirectoryPath} from './story-directory';
import {Story} from '../../store/stories/stories.types';
import {storyFileName, storySubDirectory} from '../shared/story-filename';
import {
	stopTrackingFile,
	fileWasTouched,
	wasFileChangedExternally
} from './track-file-changes';
import * as fs from "fs";

export interface StoryFile {
	htmlSource: string;
	mtime: Date;
}

/**
 * Returns a promise resolving to an array of HTML strings to load from the
 * story directory. Each string corresponds to an individual story.
 */
export async function loadStories(saveDirectory?: string) {
	const storyPath = !saveDirectory || !saveDirectory.length ? storyDirectoryPath() : saveDirectory;
	const result: StoryFile[] = [];
	const files = await readFilesRecursively(storyPath);

	await Promise.all(
		files
			.filter(f => /(\.html|\.twine)$/i.test(f))
			.map(async filePath => {
				const stats = await stat(filePath);

				if (!stats.isDirectory()) {
					result.push({
						mtime: stats.mtime,
						htmlSource: await readFile(filePath, 'utf8')
					});
					return fileWasTouched(filePath);
				}
			})
	);

	return result;
}

const readFilesRecursively = async (dir: string) : Promise<string[]> => {
	try {
		const files = await fs.promises.readdir(dir);
		const filePaths = [];

		for (const file of files) {
			const filePath = path.join(dir, file);
			const stat = await fs.promises.stat(filePath);

			if (stat.isFile()) {
				// It's a file, add it to the array
				filePaths.push(filePath);
			} else {
				// It's a directory, recursively call the function and concatenate the returned file paths
				const subDirectoryFiles = await readFilesRecursively(filePath);
				filePaths.push(...subDirectoryFiles);
			}
		}

		return filePaths;
	} catch (error) {
		console.error('Error reading directory:', error);
		return [];
	}
}

/**
 * Saves story HTML to the file system. This returns a promise that resolves
 * when complete.
 */
export async function saveStoryHtml(story: Story, storyHtml: string, storyDirectory: string = "") {
	// We save to a temp file first, then overwrite the existing if that succeeds,
	// so that if any step fails, the original file is left intact.

	// if no path is given, use default path
	if (!storyDirectory || !storyDirectory.length) {
		storyDirectory = storyDirectoryPath();
	}
	
	const savedFilePath = join(storyDirectory, storySubDirectory(story), storyFileName(story, ".twine"));
	const oldFilePath = join(storyDirectory, storyFileName(story, ".twine"));
	const oldHtmlFilePath = join(storyDirectory, storyFileName(story));

	console.log(`Saving ${savedFilePath}`);

	try {
		const tempFileDirectory = await mkdtemp(
			join(app.getPath('temp'), `twine-${story.id}`)
		);
		const tempFilePath = join(tempFileDirectory, storyFileName(story));

		if (await wasFileChangedExternally(savedFilePath)) {
			const {response} = await dialog.showMessageBox({
				buttons: [
					i18n.t('electron.errors.storyFileChangedExternally.overwriteChoice'),
					i18n.t('electron.errors.storyFileChangedExternally.relaunchChoice')
				],
				detail: i18n.t('electron.errors.storyFileChangedExternally.detail'),
				message: i18n.t('electron.errors.storyFileChangedExternally.message', {
					fileName: basename(savedFilePath)
				}),
				type: 'warning'
			});

			if (response === 1) {
				app.relaunch();
				app.quit();
				return;
			}
		}

		await writeFile(tempFilePath, storyHtml, 'utf8');
		await move(tempFilePath, savedFilePath, {
			overwrite: true
		});
		await fileWasTouched(savedFilePath);
		console.log(`Successfully saved ${savedFilePath}`);
		
		// TODO Remove this when everything is migrated
		deleteFile(oldFilePath);
		deleteFile(oldHtmlFilePath);
	} catch (e) {
		console.error(`Error while saving ${savedFilePath}: ${e}`);
		throw e;
	}
}

/**
 * Deletes a story by moving it to the trash. This returns a promise that resolves
 * when finished.
 */
export async function deleteStory(story: Story) {
	try {
		const deletedFilePath = join(storyDirectoryPath(), storySubDirectory(story), storyFileName(story));
		await deleteFile(deletedFilePath);
	} catch (e) {
		console.warn(`Error while deleting story: ${e}`);
		throw e;
	}
}

const deleteFile = async (path: string) : Promise<boolean> => {
	if (!(await pathExists(path))) {
		return false;
	}

	console.log(`Trashing ${path}`);
	await shell.trashItem(path);
	stopTrackingFile(path);
	console.log(`Successfully trashed ${path}`);
	
	return true;
}

/**
 * Renames a story in the file system. This returns a promise that resolves when
 * finished.
 */
export async function renameStory(oldStory: Story, newStory: Story) {
	try {
		const storyPath = storyDirectoryPath();
		const newStoryPath = join(storyPath, storySubDirectory(newStory), storyFileName(newStory));
		const oldStoryPath = join(storyPath, storySubDirectory(oldStory), storyFileName(oldStory));

		console.log(`Renaming ${oldStoryPath} to ${newStoryPath}`);
		await rename(oldStoryPath, newStoryPath);
		stopTrackingFile(oldStoryPath);
		await fileWasTouched(newStoryPath);
		console.log(`Successfully renamed ${oldStoryPath} to ${newStoryPath}`);
	} catch (e) {
		console.warn(`Error while renaming story: ${e}`);
		throw e;
	}
}
