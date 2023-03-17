import * as React from 'react';
import classNames from 'classnames';
import './pick-directory.css';
import {TextInput} from "./text-input";
import {IconFolder} from "@tabler/icons";
import {TwineElectronWindow} from '../../electron/shared';

export interface PickDirectoryProps {
	onChange?: (directory: string) => void;
	value: string;
}

export const PickDirectory: React.FC<PickDirectoryProps> = ({children, onChange, value}) => {
	const {twineElectron} = window as TwineElectronWindow;
	const className = classNames(
		'pick-directory',
	);

	const chooseDirectory = async () => {
		const paths = await twineElectron?.ipcRenderer.invoke("choose-directory");

		if (paths && paths.length) {
			if (onChange) {
				onChange(paths[0]);
			}
			return;
		}
	}
	
	return (
		<div className={className}>
			<TextInput value={value} readOnly>
				{children}
			</TextInput>
			<IconFolder onClick={() => chooseDirectory()}  />
		</div>
	);
};
