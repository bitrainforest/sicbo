import Head from "next/head";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import React, { FC, useCallback, useEffect } from "react";
import Styles from "@/styles/index.module.scss";
import MyHeader from "@/c/header";
import MyIndex from "@/c/index";
import { useWalletModal } from "@demox-labs/aleo-wallet-adapter-reactui";

import {
  Transaction,
  WalletAdapterNetwork,
  WalletNotConnectedError,
} from "@demox-labs/aleo-wallet-adapter-base";


export default function Home() {
  const { wallet, publicKey } = useWallet();
  return (
    <>
      <Head>
        <title>ALEO</title>
      </Head>
      <div className={Styles.main}>
        <MyHeader />
        <MyIndex />
      </div>
    </>
  );
}
