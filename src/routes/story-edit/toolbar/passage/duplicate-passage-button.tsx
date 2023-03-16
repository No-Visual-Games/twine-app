import {IconCopy} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {
    Passage,
    Story,
    useStoriesContext
} from '../../../../store/stories';
import {duplicatePassage} from "../../../../store/stories/action-creators/duplicate-passage";

export interface DuplicatePassageButtonProps {
    story: Story;
    passage?: Passage;
}

export const DuplicatePassageButton: React.FC<DuplicatePassageButtonProps> = ({
                                                                                  story,
                                                                                  passage
                                                                              }) => {
    const {dispatch} = useStoriesContext();
    const {t} = useTranslation();

    function handleClick() {
        if (!passage) {
            throw new Error('No passage set');
        }

        dispatch(duplicatePassage(story, passage));
    }

    return (
        <IconButton
            disabled={!passage}
            icon={<IconCopy/>}
            label={t('common.duplicate')}
            onClick={handleClick}
        />
    );
};
