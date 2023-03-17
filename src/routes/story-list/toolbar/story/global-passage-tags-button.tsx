import {IconTags} from '@tabler/icons';
import * as React from 'react';
import {useDialogsContext} from "../../../../dialogs";
import {IconButton} from "../../../../components/control/icon-button";
import {useTranslation} from "react-i18next";
import {GlobalPassageTagsDialog} from "../../../../dialogs/global-passage-tags";

export interface GlobalPassageTagsButtonProps {
}

export const GlobalPassageTagsButton: React.FC<GlobalPassageTagsButtonProps> = props => {
	const {dispatch: dialogsDispatch} = useDialogsContext();
	const {t} = useTranslation();

	return (
		<IconButton
			icon={<IconTags />}
			label={t('routes.storyList.toolbar.globalPassageTags')}
			onClick={() => {
				dialogsDispatch({type: 'addDialog', component: GlobalPassageTagsDialog});
			}}
		/>
	);
};
