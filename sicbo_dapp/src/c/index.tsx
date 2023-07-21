import React, { useRef, useEffect, useState, useCallback } from "react";
import Styles from "./index.module.scss";
import { Modal, Drawer, Input, Spin, message, Button } from "antd";
import Dice from "@/c/dice";
import clipboard from "copy-text-to-clipboard";

import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import { useWalletModal } from "@demox-labs/aleo-wallet-adapter-reactui";
import {
  Transaction,
  WalletAdapterNetwork,
  WalletNotConnectedError,
} from "@demox-labs/aleo-wallet-adapter-base";
import { tryParseJSON, isNum, timestampToTime } from "./utils";

const apiUrl = process.env.NEXT_PUBLIC_API_HOST;

export default function Home() {
  const { visible, setVisible } = useWalletModal();

  const copyText = useCallback((text: string) => {
    if (clipboard(text)) {
      message.success("copy success");
    } else {
      message.error("copy success");
    }
  }, []);

  const { wallet, publicKey }: any = useWallet();
  let [modalShow, setModalShow] = useState(false);
  let [modalShow1, setModalShow1] = useState(false);
  let [drawerShow, setDrawerShow] = useState(false);
  let [drawerShow1, setDrawerShow1] = useState(false);
  const [num, setNum] = useState("");
  const changeNum = (e: any) => {
    setNum(e.target.value);
  };

  const childRef1 = useRef<any>();
  const childRef2 = useRef<any>();
  const childRef3 = useRef<any>();

  // 代币余额
  const [chipsBalance, setChipsBalance] = useState<any>("");
  const [recentRecord, setRecentRecord] = useState({
    win: "",
    winTime: "",
    loss: "",
    lossTime: "",
  });
  const [noticeTxt, setNoticeTxt] = useState("");
  const [diceArr, setDiceArr] = useState<number[]>([4, 5, 6]);
  const [diceArrTotal, setDiceArrTotal] = useState<number | string>("?");
  // 开始骰子动画
  const dicesStart = (arr: number[], param: any) => {
    setDiceArr(arr);
    setDiceArrTotal("?");
    setTimeout(() => {
      childRef1?.current?.dado?.();
    }, 0);
    setTimeout(() => {
      childRef2?.current?.dado?.();
    }, 100);
    setTimeout(() => {
      childRef3?.current?.dado?.();
    }, 200);
    setTimeout(() => {
      setDiceArrTotal(arr[0] + arr[1] + arr[2]);
    }, 3500);

    setTimeout(() => {
      openRetDialog(param);
    }, 4000);
  };
  // 打开历史
  const [rankLoading, setRankLoading] = useState(false);
  const [hisArr, setHisArr] = useState<any>([]);
  const openRank = () => {
    if (!publicKey) {
      return;
    }
    setDrawerShow1(true);
    setRankLoading(true);
    fetch(`${apiUrl}/api/game/record?page=1&limit=99&wallet=${publicKey}`)
      .then((response) => response.json())
      .then((ret) => {
        const data = ret.data;
        setHisArr(data.rows);
        setRankLoading(false);
      });
  };

  const [retDialogObj, setRetDialogObj] = useState({
    big: true,
    win: true,
    num: 11,
  });
  // 打开结果弹窗
  const openRetDialog = ({
    big,
    win,
    num,
  }: {
    big: boolean;
    win: boolean;
    num: number;
  }) => {
    setRetDialogObj({ big, win, num });
    setModalShow(true);
  };

  const [selectBig, setSelectBig] = useState(false);
  // 打开下注弹窗
  const openBettingDrawer = () => {
    if (!isOpen || chipsBalance <= 0) {
      return;
    }
    setNum("");
    setSelectBig(false);
    setDrawerShow(true);
  };
  // 下注钱准备
  const guessReady = () => {
    if (!publicKey) {
      setVisible(true);
      return;
    }
    if (!isNum(num, true)) {
      message.error("please enter an integer");
      return;
    }
    // 获取下注参数
    fetch(`${apiUrl}/api/player/chips/record?wallet=${publicKey}`)
      .then((response) => response.json())
      .then((ret) => {
        const record = ret.data?.cipherText;
        // 通知下注
        fetch(`${apiUrl}/api/game/bet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet: publicKey,
            amount: num,
            guess: selectBig ? 2 : 1,
          }),
        })
          .then((response) => response.json())
          .then((ret) => {
            if (ret.code == 0) {
              sessionStorage.setItem("guessyes", String(new Date().getTime()));
              guessSubmit(record);
            } else {
              // 20 min 防止用户关闭了
              if (
                (Number(sessionStorage.getItem("guessyes")) || 0) +
                  20 * 60 * 60000 >
                new Date().getTime()
              ) {
                guessSubmit(record);
              } else {
                message.error(ret.msg);
              }
            }
          });
      });
  };

  // 下注
  const guessSubmit = useCallback(
    async (txt: any) => {
      console.log(txt);
      const decryptedPayload =
        (await (wallet?.adapter as LeoWalletAdapter).decrypt(txt)) || "";
      const inputsArray = [
        String(selectBig),
        decryptedPayload.replaceAll(/\s/g, ""),
        `${num}u64`, // 下注金额
        "aleo1ehk2g298nnjyzpdhqg8w7pxsp8aphrq88f4frv5c78mjalwydufq8xx8u8",
        publicKey, // 玩家地址
      ];
      // const parsedInputs = inputsArray.map((input) => tryParseJSON(input));
      const parsedInputs = inputsArray;
      console.log(parsedInputs);
      const programId = "sicbo_v100002.aleo";
      const functionName = "betting";
      const fee = parseFloat("5000000");
      const aleoTransaction = Transaction.createTransaction(
        publicKey,
        WalletAdapterNetwork.Testnet,
        programId,
        functionName,
        parsedInputs,
        fee!
      );
      const txId = await (
        wallet?.adapter as LeoWalletAdapter
      ).requestTransaction(aleoTransaction);
      console.log(txId);
      localStorage.setItem("curTxid", txId);
      setConfirms({
        txt: "",
        time: timestampToTime(new Date().getTime()),
      });
      setTransactionId(txId);
      setModalShow1(true);
      setDrawerShow(false);
    },
    [num, publicKey, selectBig, wallet]
  );

  let [transactionId, setTransactionId] = useState<any>();
  // 查询上链情况
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (transactionId) {
      intervalId = setInterval(async () => {
        const txt = await (
          wallet?.adapter as LeoWalletAdapter
        ).transactionStatus(transactionId);

        setConfirms({
          txt,
          time: timestampToTime(new Date().getTime()),
        });
        if (txt == "Failed" || txt == "Completed" || txt == "Finalized") {
          // localStorage.removeItem("curTxid");
          clearInterval(intervalId);
          if (txt == "Completed" || txt == "Finalized") {
            setHashModal(true);
            setModalShow1(false);
          } else {
            localStorage.removeItem("curTxid");
          }
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [transactionId, wallet?.adapter]);

  useEffect(() => {
    if (!publicKey) {
      return;
    }

    const txId = localStorage.getItem("curTxid");
    if (txId) {
      setTransactionId(txId);
      setModalShow1(true);
    }
    // setNoticeTxt(
    //   "Last Lucky Number 9,The current period has opened - 100th issue,"
    // );
  }, [publicKey]);
  const [isOpen, setIsOpen] = useState(false);
  const [confirms, setConfirms] = useState({
    txt: "",
    time: "",
  });
  useEffect(() => {
    const v1 = () => {
      fetch(`${apiUrl}/api/game/status`)
        .then((response) => response.json())
        .then((ret) => {
          const data = ret.data;
          setIsOpen(data == "opening");
        });

      if (publicKey) {
        // 获取用户信息 主要用于更新余额
        fetch(`${apiUrl}/api/player/info?wallet=${publicKey}`)
          .then((response) => response.json())
          .then((ret) => {
            const data = ret.data;
            setChipsBalance(Number(data.balance));
            setRecentRecord({
              win: `+ ${Number(data.winBalance)}`,
              winTime: `${data.winCount} time`,
              loss: `- ${Number(data.loseBalance)}`,
              lossTime: `${data.loseCount} time`,
            });
          });
      } else {
        setChipsBalance("");
        setRecentRecord({
          win: "",
          winTime: "",
          loss: "",
          lossTime: "",
        });
      }
    };
    const interval = setInterval(() => {
      // 获取是否开盘
      v1();
    }, 5000);
    v1();

    return () => clearInterval(interval);
  }, [publicKey]);

  const [hashModal, setHashModal] = useState(false);
  const [hashloading, setHashLoading] = useState(false);
  const [curhash, setCurhash] = useState("");
  const changeHash = (e: any) => {
    setCurhash(e.target.value);
  };

  const hashConfirm = () => {
    if (!curhash) {
      message.error("please enter an hash");
      return;
    }
    setHashLoading(true);
    fetch(`${apiUrl}/api/game/settlement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet: publicKey,
        transactionId: curhash,
      }),
    })
      .then((response) => response.json())
      .then((ret) => {
        if (ret.code == 0) {
          const data = ret.data;
          localStorage.removeItem("curTxid");
          // 打开成功页面
          setHashModal(false);
          setCurhash("");
          let n = data.dice;
          const param = {
            big: data.dice > 10,
            win: data.gameResult != "lose",
            num: data.betAmount,
          };
          let arr = [0, 0, 0];
          const getArr = (n: any) => {
            function findCombinations(targetSum: number) {
              const combinations = [];
              for (let i = 1; i <= 6; i++) {
                for (let j = 1; j <= 6; j++) {
                  for (let k = 1; k <= 6; k++) {
                    if (i + j + k === targetSum) {
                      combinations.push([i, j, k]);
                    }
                  }
                }
              }
              return combinations;
            }
            const arrs = findCombinations(n);
            return arrs[Math.floor(Math.random() * arrs.length)];
          };
          arr = getArr(n);
          dicesStart(arr, param);
        } else {
          message.error(ret.msg);
        }
      })
      .finally(() => {
        setHashLoading(false);
      });
  };
  const closeModalShow1 = () => {
    setModalShow1(false);
    if (confirms.txt == "Failed") {
      setDrawerShow(true);
    }
  };

  return (
    <>
      <div className={Styles.box}>
        <div className={Styles.balance}>
          <img src="/img/chips.png" /> {chipsBalance || "0.00"}
        </div>
        <div className={Styles.rets} onClick={() => openRank()}>
          <div className={Styles.l}>
            <img src="/img/win.png" alt="" />
            You Win
          </div>
          <div className={Styles.r}>
            <img src="/img/loss.png" alt="" />
            You Lose
          </div>
          <div className={Styles.box1}>
            <div>
              <div>{recentRecord.win === "" ? "0.00" : recentRecord.win}</div>
              <div>
                {recentRecord.winTime === "" ? "0 time" : recentRecord.winTime}
              </div>
            </div>
            <div>
              <div>{recentRecord.loss === "" ? "0.00" : recentRecord.loss}</div>
              <div>
                {recentRecord.lossTime === ""
                  ? "0 time"
                  : recentRecord.lossTime}
              </div>
            </div>
          </div>
        </div>
        <div className={Styles.dice}>
          {/* <div className={Styles.notice}>
            <div className={Styles.cont}>
              <div>{noticeTxt}</div>
              <div>{noticeTxt}</div>
            </div>
          </div> */}
          <div className={Styles.dicebg}>
            <div className={Styles.dices}>
              <div style={{ left: "65px", top: "-90px" }}>
                <Dice cRef={childRef1} n={diceArr[0]} />
              </div>
              <div style={{ left: "0" }}>
                <Dice cRef={childRef2} n={diceArr[1]} />
              </div>
              <div style={{ left: "-50px", top: "-80px" }}>
                <Dice cRef={childRef3} n={diceArr[2]} />
              </div>
            </div>
            <div className={Styles.bottom}>{diceArrTotal}</div>
          </div>
          <div className={Styles.rules}>
            <div>
              <img src="/img/tips.png" />
              Game rules
            </div>
            <ul>
              <li>Each wallet will get 1000 Chips after linking;</li>
              <li>
                Each time the market is opened by the dealer, a group of numbers
                is randomly selected through the contract to sum, ranging from 3
                to 18;
              </li>
              <li>
                The player chooses to guess big (11-18 is big) or small (3-10 is
                small), and bet a certain amount of Chips (transferred to the
                banker&apos;s address through the contract);
              </li>
              <li>
                After the lottery is drawn by the dealer, those who guess
                correctly will get 2 times the bet amount of Chips, and those
                who guess wrong will not get any rewards;
              </li>
            </ul>
          </div>
        </div>
        <div className={Styles.bottomfoot}>
          <div
            className={`${Styles.letme} ${
              isOpen && chipsBalance > 0 ? "" : Styles.disabled
            }`}
            onClick={() => openBettingDrawer()}
          >
            {isOpen
              ? "Let me guess"
              : chipsBalance == 0
              ? "Chips are being distributed"
              : "Waiting for lottery"}

            <img src="/img/r-img.png" alt="" className={Styles.rimg} />
          </div>
        </div>
      </div>

      {/* 下注结果弹窗 */}
      <Modal
        open={modalShow}
        className={"mymodal"}
        onCancel={() => setModalShow(false)}
      >
        <div className="myhead" style={{ backgroundColor: "#37346C" }}>
          {retDialogObj.big ? (
            <img src="/img/big.png" alt="" />
          ) : (
            <img src="/img/small.png" alt="" />
          )}
        </div>
        <div className="mybody">
          {retDialogObj.win ? (
            <div className={Styles.modaldiv}>
              <div>Congratulations on getting</div>
              <div>
                <img src="/img/chips-b.png" alt="" />
                {retDialogObj.num}
              </div>
            </div>
          ) : (
            <div className={Styles.modaldivloss}>
              <div>
                <img src="/img/wait.png" alt="" />
              </div>
              <div>Did not win this time</div>
            </div>
          )}

          <div className="mybutton" onClick={() => setModalShow(false)}>
            <div>{retDialogObj.win ? 'Receive Bonus' : 'Next Time'}</div>
          </div>
        </div>
      </Modal>

      {/* 下注过程 */}

      <Drawer
        placement="bottom"
        onClose={() => setDrawerShow(false)}
        open={drawerShow}
        rootClassName={"mydrawer-root"}
        size={"default"}
      >
        <div className="myhead">Guess</div>
        <div className={Styles.drawerform}>
          <div className={Styles.ipts}>
            <div
              className={!selectBig ? Styles.active : ""}
              onClick={() => setSelectBig(false)}
            >
              <img src="/img/small.png" alt="" />
            </div>
            <div>
              <Input
                onChange={(e) => changeNum(e)}
                value={num}
                className={Styles.ipt}
                placeholder="0.00"
              />
            </div>
            <div
              className={selectBig ? Styles.active : ""}
              onClick={() => setSelectBig(true)}
            >
              <img src="/img/big.png" alt="" />
            </div>
          </div>

          <div className={Styles.balance}>
            <div>
              <img src="/img/chips-b.png" alt="" />
              Chips
            </div>
            <div>{chipsBalance}</div>
          </div>
          <div className={Styles.payment}>
            <div className={Styles.title}>Payment</div>
            <div
              className={Styles.item1}
              onClick={() => copyText(publicKey || "")}
            >
              <div>
                {(publicKey || "").replace(/(.{12}).*(.{12})/, "$1...$2")}
              </div>
              <div>
                <img src="/img/copy.png" alt="" />
              </div>
            </div>
            <div className={Styles.item2}>
              <div>
                <img src="/img/aleo.png" alt="" />
                Miner fee
              </div>
              <div>5 Aleo</div>
            </div>
            <div className={Styles.aleoBalance}>
              {/* Aleo Balance 23.222 */}
            </div>

            <div className={Styles.btnsubmit} onClick={() => guessReady()}>
              Sure Guess {selectBig ? "Big" : "Small"}
            </div>
          </div>
        </div>
      </Drawer>
      <Modal
        open={modalShow1}
        className={`submitmodal mymodal ${confirms.txt !== "Failed" ? "noclose" : ""}`}
        maskClosable={false}
        keyboard={false}
        onCancel={() => closeModalShow1()}
      >
        <div className={Styles.statusBet}>
          <div className={`${Styles.statusTxt} ${Styles.def}`}>
            <div>{confirms.txt}</div>
            <div>{confirms.time}</div>
          </div>
        </div>
      </Modal>

      {/* 历史 */}
      <Drawer
        placement="bottom"
        onClose={() => setDrawerShow1(false)}
        open={drawerShow1}
        rootClassName={"mydrawer-root rank"}
        size={"large"}
      >
        {rankLoading ? (
          <div style={{ textAlign: "center" }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div className={Styles.cctitle}>Guess details</div>
            <div className={Styles.ranksitem}>
              {hisArr.map((i: any) => {
                return (
                  <div className={Styles.item} key={i.id}>
                    <div>
                      <img
                        src={
                          i.gameResult == "win"
                            ? "/img/win.png"
                            : "/img/loss.png"
                        }
                        alt=""
                      />
                    </div>
                    <div>
                      <div>
                        {i.gameResult == "win" ? `+ ${i.betBalance * 2}` : `- ${i.betBalance}`}
                      </div>
                      <div>Betting {i.betBalance}</div>
                    </div>
                    <div>
                      <div>{i.gameDice}</div>
                      <div>Guess {i.betResult == 1 ? "Small" : "Big"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Drawer>

      <Modal
        className={"submitmodal"}
        open={hashModal}
        maskClosable={false}
        keyboard={false}
        onOk={hashConfirm}
        onCancel={() => setHashModal(false)}
        footer={[
          <Button
            key="link"
            type="primary"
            onClick={hashConfirm}
            loading={hashloading}
          >
            Submit
          </Button>,
        ]}
      >
        <div className={Styles.statusBet}>
          <div className={Styles.statusTxt}>
            <div>Successful bet ！</div>
            <div>{confirms.time}</div>
          </div>
        </div>
        <div className={Styles.confirmTxt}>Confirm Transaction ID</div>
        <Input
          onChange={(e) => changeHash(e)}
          value={curhash}
          placeholder="Transaction ID"
        />
      </Modal>
    </>
  );
}
