import {Story} from '../../store/stories/stories.types';

/**
 * Returns a filename for a story object that's guaranteed to be safe across all
 * platforms. For this, we use POSIX's definition
 * (http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html#tag_03_276)
 * with the addition of spaces, for legibility.
 */
export function storyFileName(story: Story, extension = '.html') {
	return story.name.replace(/[^\w. -]/g, '_') + extension;
}

export function storySubDirectory(story: Story) {
	const gamePartTag = story.tags.find(t => t.startsWith("part:"))
	const mapTag = story.tags.find(t => t.startsWith("map:"))
	
	if (gamePartTag && mapTag) {
		return `${gamePartTag.replace("part:", "")}/Dialogues/${mapTag.replace("map:", "")}`
	}
	
	return "";
}