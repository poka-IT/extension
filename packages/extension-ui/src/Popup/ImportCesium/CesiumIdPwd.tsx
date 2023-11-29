// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@polkadot/util-crypto/types';
import type { AccountInfo } from './index.js';

import React, { useEffect, useState } from 'react';

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

function CesiumIdPwd ({ className, onAccountChange, onNextStep, type }: Props): React.ReactElement {
  const { t } = useTranslation();
  const genesisOptions = useGenesisHashOptions();
  const [address, setAddress] = useState('');
  const [csID, setCsID] = useState<string | null>(null);
  const [csPwd, setCsPwd] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [genesis, setGenesis] = useState('');

  useEffect(() => {
    // No need to validate an empty ID or password
    // we have a dedicated error for this
    if (!csID || !csPwd) {
      onAccountChange(null);

      return;
    }

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
        setError(t('Invalid Cesium ID or password')
        );
      });
  }, [t, genesis, csID, csPwd, onAccountChange, type]);

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
          isFocused
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
          isDisabled={!address || !!error}
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
