import "@/styles/globals.scss";
import type { AppProps } from "next/app";

import React, { FC, useMemo } from "react";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";
require("@demox-labs/aleo-wallet-adapter-reactui/styles.css");

export default function App({ Component, pageProps }: AppProps) {
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: "ALEO DEMO",
      }),
    ],
    []
  );
  return (
    <WalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.Testnet}
      autoConnect
    >
      <WalletModalProvider>
        <div className="body">
          <Component {...pageProps} />
        </div>
      </WalletModalProvider>
    </WalletProvider>
  );
}
