import React from 'react';
import { CeloProvider } from '@celo/react-celo';
import CreatorWallet from './components/CreatorWallet';

export default function App() {
  return (
    <CeloProvider
      dapp={{
        name: 'KasiKoin',
        description: 'Empowering township creators',
        url: 'https://kasikoin.africa',
      }}
      connectModal={{
        title: 'Connect to KasiKoin',
        providersOptions: { searchable: true },
      }}
    >
      <CreatorWallet />
    </CeloProvider>
  );
}
