import {TwineElectronWindow} from '../../../../electron/shared';
import {Story} from '../../../stories';
import {publishStory, publishStoryWithFormat} from '../../../../util/publish';
import {
	formatWithNameAndVersion,
	StoryFormatsState
} from '../../../story-formats';
import {getAppInfo} from '../../../../util/app-info';
import {fetchStoryFormatProperties} from '../../../../util/story-format/fetch-properties';

/**
 * Sends an IPC message to save a story to disk, ideally in published form.
 */
export async function saveStory(story: Story, formats: StoryFormatsState, storySaveDirectory: string = "") {
	const {twineElectron} = window as TwineElectronWindow;

	if (!twineElectron) {
		throw new Error('Electron bridge is not present on window.');
	}

	console.log("Saving story to directory", storySaveDirectory)
	
	try {
		const format = formatWithNameAndVersion(
			formats,
			story.storyFormat,
			story.storyFormatVersion
		);

		if (format.loadState === 'loaded') {
			twineElectron.ipcRenderer.send(
				'save-story-html',
				story,
				publishStoryWithFormat(story, format.properties.source, getAppInfo(), {
					startOptional: true
				}),
				storySaveDirectory
			);
		} else {
			const {source} = await fetchStoryFormatProperties(format.url);

			twineElectron.ipcRenderer.send(
				'save-story-html',
				story,
				publishStoryWithFormat(story, source, getAppInfo(), {
					startOptional: true
				}),
				storySaveDirectory
			);
		}
	} catch (error: any) {
		console.warn(
			`Could not save full story (${error.message}). Trying to save story data only.`
		);
		twineElectron.ipcRenderer.send(
			'save-story-html',
			story,
			publishStory(story, getAppInfo(), {startOptional: true}),
			storySaveDirectory
		);
	}
}
