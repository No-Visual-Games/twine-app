import classNames from 'classnames';
import * as React from 'react';
import './text-input.css';

export interface TextInputProps {
	name?: string,
	children: React.ReactNode;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onInput?: (event: React.FormEvent<HTMLInputElement>) => void;
	orientation?: 'horizontal' | 'vertical';
	placeholder?: string;
	type?: 'search' | 'text';
	readOnly?: boolean;
	value: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
	(props, ref) => {
		const className = classNames(
			'text-input',
			`orientation-${props.orientation}`,
			`type-${props.type}`
		);

		return (
			<span className={className}>
				<label>
					<span className="text-input-label">{props.children}</span>
					<input
						name={props.name || "text"}
						onChange={props.onChange}
						onInput={props.onInput}
						placeholder={props.placeholder}
						ref={ref}
						type={props.type ?? 'text'}
						value={props.value}
						readOnly={props.readOnly}
					/>
				</label>
			</span>
		);
	}
);
