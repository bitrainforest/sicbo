import React, { FC, useCallback } from "react";
import Styles from "./header.module.scss";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";

export default function header() {
  return (
    <>
      <div className={Styles.header}>
        <div className={Styles.logo}>
          <img src="/img/logo.png" alt="" />
        </div>
        <div>Balance</div>
        <div className={Styles.aleo}>
          <WalletMultiButton
            style={{ background: "transparent" }}
          ></WalletMultiButton>
        </div>
      </div>
    </>
  );
}
