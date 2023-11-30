// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react';

import Label from './Label.js';
import { TextArea } from './TextInputs.js';

interface Props {
  className?: string;
  isError?: boolean;
  isFocused?: boolean;
  isReadOnly?: boolean;
  rowsCount?: number;
  label: string;
  onChange?: (value: string) => void;
  value?: string;
}

export default function TextAreaWithLabel ({ className, isError, isFocused, isReadOnly, label, onChange, rowsCount, value }: Props): React.ReactElement<Props> {
  const _onChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>): void => {
  onChange && onChange(value);
    },
    [onChange]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); 
    }
  };

  return (
    <Label
      className={className}
      label={label}
    >
      <TextArea
        autoCapitalize='off'
        autoComplete='off'
        autoCorrect='off'
        autoFocus={isFocused}
        onChange={_onChange}
        readOnly={isReadOnly}
        rows={rowsCount || 2}
        spellCheck={false}
        value={value}
        withError={isError}
        onKeyDown={handleKeyDown}
      />
    </Label>
  );
}
