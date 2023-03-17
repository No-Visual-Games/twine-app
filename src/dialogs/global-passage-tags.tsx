import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {DialogCard} from '../components/container/dialog-card';
import {CardContent} from '../components/container/card';
import {DialogComponentProps} from './dialogs.types';
import {setPref, usePrefsContext} from '../store/prefs';
import {Color} from '../util/color';
import {TagEditor} from '../components/tag/tag-editor';
import {AddTagButton} from "../components/tag";
import "./global-passage-tags.css";

export type GlobalPassageTagsDialogProps = DialogComponentProps;

export const GlobalPassageTagsDialog: React.FC<GlobalPassageTagsDialogProps> = props => {
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const {t} = useTranslation();

	function handleChangeColor(tagName: string, color: Color) {
		prefsDispatch(
			setPref('globalPassageTagsColors', {...prefs.globalPassageTagsColors, [tagName]: color})
		);
	}

	function handleChangeTagName(tagName: string, newName: string) {
		// storiesDispatch(renameStoryTag(stories, tagName, newName));
	}
	
	function handleAddTag(tagName: string, color?: Color) {
		prefsDispatch({
			type: 'update',
			name: 'globalPassageTags',
			value: [...prefs.globalPassageTags, tagName]
		});
		
		if (color) {
			handleChangeColor(tagName, color)
		}
	}

	function handleChangeTagRemove(tagName: string) {
		prefsDispatch({
			type: 'update',
			name: 'globalPassageTags',
			value: prefs.globalPassageTags.filter(name => name !== tagName)
		});
		
		delete prefs.globalPassageTagsColors[tagName]
		
		prefsDispatch(
			setPref('globalPassageTagsColors', {...prefs.globalPassageTagsColors})
		);
	}

	return (
		<DialogCard
			className="global-passage-tags-dialog"
			fixedSize
			headerLabel={t('dialogs.storyTags.globalTagsTitle')}
			{...props}
		>
			<CardContent>
				<AddTagButton 
					assignedTags={[]}
					existingTags={[]}
					onAdd={handleAddTag}
					hideIfEmptyExistingTags
				/>
				{prefs.globalPassageTags.length > 0 ? (
					prefs.globalPassageTags.map(tag => (
						<TagEditor
							allTags={prefs.globalPassageTags}
							color={prefs.globalPassageTagsColors[tag]}
							key={tag}
							name={tag}
							allowRemove
							onChangeColor={color => handleChangeColor(tag, color)}
							onChangeName={newName => handleChangeTagName(tag, newName)}
							onRemove={tag => handleChangeTagRemove(tag)}
						/>
					))
				) : (
					<p>{t('dialogs.storyTags.noGlobalTags')}</p>
				)}
			</CardContent>
		</DialogCard>
	);
};
