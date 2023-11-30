// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@polkadot/util-crypto/types';
import type { AccountInfo } from './index.js';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { validateCesiumWallet } from '@polkadot/extension-ui/messaging';
import { objectSpread } from '@polkadot/util';

import { ButtonArea, Dropdown, NextStepButton, TextAreaWithLabel, VerticalSpace, Warning } from '../../components/index.js';
import { useGenesisHashOptions, useTranslation } from '../../hooks/index.js';
import { styled } from '../../styled.js';

interface Props {
  className?: string;
  onNextStep: () => void;
  onAccountChange: (account: AccountInfo | null) => void;
  type: KeypairType;
}

function debounce<T extends (...args: any[]) => void>(func: T, waitFor: number): (...args: Parameters<T>) => void {
  let timeout: number | undefined;

  return function(...args: Parameters<T>): void {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), waitFor) as unknown as number;
  };
}

function CesiumIdPwd ({ className, onAccountChange, onNextStep, type }: Props): React.ReactElement {
  const { t } = useTranslation();
  const genesisOptions = useGenesisHashOptions();
  const [address, setAddress] = useState('');
  const [csID, setCsID] = useState<string | null>(null);
  const [csPwd, setCsPwd] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [genesis, setGenesis] = useState('');
  const [isWaitingDebounce, setIsWaitingDebounce] = useState(false);
  const operationIdRef = useRef(0);

 
  const debouncedValidateCesiumWallet = useCallback(debounce((csID, csPwd) => {
    const currentOpId = operationIdRef.current;
    validateCesiumWallet(csID, csPwd, type)
      .then((validatedAccount) => {
        setError('');
        setAddress(validatedAccount.address);
        onAccountChange(
          objectSpread<AccountInfo>({}, validatedAccount, { genesis, type })
        );
      })
      .catch(() => {
        setAddress('');
        onAccountChange(null);
        setError(t('Invalid Cesium ID or password'));
      })
      .finally(() => {
        if (currentOpId === operationIdRef.current) {
          setIsWaitingDebounce(false);
        }
      });
    }, 600), [type, t, genesis, setIsWaitingDebounce]);
  
    useEffect(() => {
      if (!csID || !csPwd) {
        onAccountChange(null);
        setIsWaitingDebounce(false);
        return;
      }
    
      operationIdRef.current += 1;
      setIsWaitingDebounce(true);
      debouncedValidateCesiumWallet(csID, csPwd);
    }, [csID, csPwd, debouncedValidateCesiumWallet]);
  
  return (
    <>
      <div className={className}>
        <TextAreaWithLabel
          className='CesiumIDInput'
          isError={!!error}
          isFocused
          label={t('Your Cesium wallet ID (Ğ1v1)')}
          onChange={setCsID}
          rowsCount={1}
          value={csID || ''}
        />
        {!!error && !csID && (
          <Warning
            className='CesiumIDError'
            isBelowInput
            isDanger
          >
            {t('Wrong Cesium wallet ID format')}
          </Warning>
        )}
        <TextAreaWithLabel
          className='CesiumPwdInput'
          isError={!!error}
          label={t('Your Cesium wallet password (Ğ1v1)')}
          onChange={setCsPwd}
          rowsCount={1}
          value={csPwd || ''}
        />
        {!!error && !csPwd && (
          <Warning
            className='CesiumPwdError'
            isBelowInput
            isDanger
          >
            {t('Wrong Cesium wallet password format')}
          </Warning>
        )}
        <Dropdown
          className='genesisSelection'
          label={t('Network')}
          onChange={setGenesis}
          options={genesisOptions}
          value={genesis}
        />
      </div>
      <VerticalSpace />
      <ButtonArea>
        <NextStepButton
          isDisabled={!address || !!error || isWaitingDebounce}
          onClick={onNextStep}
        >
          {t('Next')}
        </NextStepButton>
      </ButtonArea>
    </>
  );
}

export default styled(CesiumIdPwd)<Props>`
  .genesisSelection {
    margin-bottom: var(--fontSize);
  }

  .CesiumIDInput {
    margin-bottom: var(--fontSize);
    textarea {
      height: unset;
    }
  }

  .CesiumIDError {
    margin-bottom: 1rem;
  }

  .CesiumPwdInput {
    margin-bottom: var(--fontSize);
    textarea {
      height: unset;
    }
  }

  .CesiumPwdError {
    margin-bottom: 1rem;
  }
`;
