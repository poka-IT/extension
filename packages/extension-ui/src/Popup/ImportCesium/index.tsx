// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import React, { useCallback, useContext, useEffect, useState } from 'react';

import AccountNamePasswordCreation from '../../components/AccountNamePasswordCreation.js';
import { AccountContext, ActionContext, Address } from '../../components/index.js';
import { useMetadata, useTranslation } from '../../hooks/index.js';
import { createAccountCesium } from '../../messaging.js';
import { HeaderWithSteps } from '../../partials/index.js';
import { DEFAULT_TYPE } from '../../util/defaultType.js';
import CesiumIdPwd from './CesiumIdPwd.js';

export interface AccountInfo {
  address: string;
  genesis?: HexString;
  csID: string;
  csPwd: string;
}

function ImportCesium (): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [step1, setStep1] = useState(true);
  const [type, setType] = useState(DEFAULT_TYPE);
  const chain = useMetadata(account?.genesis, true);

  useEffect((): void => {
    !accounts.length && onAction();
  }, [accounts, onAction]);

  useEffect((): void => {
    setType(
      chain && chain.definition.chainType === 'ethereum'
        ? 'ethereum'
        : DEFAULT_TYPE
    );
  }, [chain]);

  const _onCreate = useCallback((name: string, password: string): void => {
    // this should always be the case
    if (name && password && account) {
      setIsBusy(true);

      createAccountCesium(name, password, account.csID, account.csPwd, 'ed25519', account.genesis)
        .then(() => onAction('/'))
        .catch((error): void => {
          setIsBusy(false);
          console.error(error);
        });
    }
  }, [account, onAction, type]);

  const _onNextStep = useCallback(
    () => setStep1(false),
    []
  );

  const _onBackClick = useCallback(
    () => setStep1(true),
    []
  );

  return (
    <>
      <HeaderWithSteps
        step={step1 ? 1 : 2}
        text={t('Import Cesium wallet')}
      />
      <div>
        <Address
          address={account?.address}
          genesisHash={account?.genesis}
          name={name}
        />
      </div>
      {step1
        ? (
          <CesiumIdPwd
            onAccountChange={setAccount}
            onNextStep={_onNextStep}
            type={'ed25519'}
          />
        )
        : (
          <AccountNamePasswordCreation
            buttonLabel={t('Add the account with this Cesium ID')}
            isBusy={isBusy}
            onBackClick={_onBackClick}
            onCreate={_onCreate}
            onNameChange={setName}
          />
        )
      }
    </>
  );
}

export default ImportCesium;
