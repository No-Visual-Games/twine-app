import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {IconPlus} from '@tabler/icons';
import {usePrefsContext} from '../../../../store/prefs';
import {
	createStory,
	storyDefaults,
	useStoriesContext
} from '../../../../store/stories';
import {PromptButton} from '../../../../components/control/prompt-button';
import {unusedName} from '../../../../util/unused-name';

export const CreateStoryButton: React.FC = () => {
	const {dispatch, stories} = useStoriesContext();
	const [newName, setNewName] = React.useState(
		unusedName(
			storyDefaults().name,
			stories.map(story => story.name)
		)
	);
	const [gamePart, setGamePart] = React.useState<string | undefined>(undefined)
	const [map, setMap] = React.useState<string | undefined>(undefined)
	const history = useHistory();
	const {prefs} = usePrefsContext();
	const {t} = useTranslation();

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		console.log("Changed", e.target.name)
		if (e.target.name == "gamePart") {
			setGamePart(e.target.value)
			return
		}

		if (e.target.name == "map") {
			setMap(e.target.value)
			return
		}

		setNewName(e.target.value)
	}
	
	function validateName(value: string) {
		if (value.trim() === '') {
			return {
				valid: false,
				message: t('routes.storyList.toolbar.createStoryButton.emptyName')
			};
		}

		if (
			stories.some(story => story.name.toLowerCase() === value.toLowerCase())
		) {
			return {
				valid: false,
				message: t('routes.storyList.toolbar.createStoryButton.nameConflict')
			};
		}

		return {valid: true};
	}

	function handleSubmit() {
		const id = createStory(stories, prefs, {name: newName, gamePart, map})(
			dispatch,
			() => stories
		);

		history.push(`/stories/${id}`);
	}

	return (
		<PromptButton
			icon={<IconPlus />}
			label={t('common.new')}
			submitLabel={t('common.create')}
			submitVariant="create"
			onChange={handleChange}
			onSubmit={handleSubmit}
			prompt={t('routes.storyList.toolbar.createStoryButton.prompt')}
			validate={validateName}
			value={newName}
			fields={[
				{name: "gamePart", label: "Game Part", value: gamePart || ""},
				{name: "map", label: "Map", value: map || ""},
			]}
		/>
	);
};
