import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
const DiceAnimation = ({ cRef, n }: any) => {
  const [platformClass, setPlatformClass] = useState("platform");
  const [platformStyle, setPlatformStyle] = useState({});
  const [platformStyle1, setPlatformStyle1] = useState({});

  function dado() {
    // const platformD = platformRef.current.value;
    // const diceD = diceRef.current.value;
    setPlatformClass("platform playing");
    // platformD.removeClass("stop").addClass("playing");
    setTimeout(function () {
      setPlatformClass("platform stop");
      // platformD.removeClass("playing").addClass("stop");
      var number = n ? n : Math.floor(Math.random() * 6) + 1;
      var x = 0,
        y = 20,
        z = -20;
      switch (number) {
        case 1:
          x = 0;
          y = 20;
          z = -20;
          break;
        case 2:
          x = -100;
          y = -150;
          z = 10;
          break;
        case 3:
          x = 0;
          y = -100;
          z = -10;
          break;
        case 4:
          x = 0;
          y = 100;
          z = -10;
          break;
        case 5:
          x = 80;
          y = 120;
          z = -10;
          break;
        case 6:
          x = 0;
          y = 200;
          x = 10;
          break;
      }
      setPlatformStyle1({
        transform:
          "rotateX(" + x + "deg) rotateY(" + y + "deg) rotateZ(" + z + "deg)",
      });
      setPlatformStyle({
        transform: "translate3d(0,0, 0px)",
      });

      // diceD.css({
      //   transform:
      //     "rotateX(" + x + "deg) rotateY(" + y + "deg) rotateZ(" + z + "deg)",
      // });

      // platformD.css({
      //   transform: "translate3d(0,0, 0px)",
      // });
    }, 3120);
  }
  useImperativeHandle(cRef, () => ({
    dado: dado,
  }));
  useEffect(() => {
    var x = 0,
      y = 20,
      z = -20;
    switch (n) {
      case 1:
        x = 0;
        y = 20;
        z = -20;
        break;
      case 2:
        x = -100;
        y = -150;
        z = 10;
        break;
      case 3:
        x = 0;
        y = -100;
        z = -10;
        break;
      case 4:
        x = 0;
        y = 100;
        z = -10;
        break;
      case 5:
        x = 80;
        y = 120;
        z = -10;
        break;
      case 6:
        x = 0;
        y = 200;
        x = 10;
        break;
    }

    setPlatformStyle1({
      transform:
        "rotateX(" + x + "deg) rotateY(" + y + "deg) rotateZ(" + z + "deg)",
    });
    setPlatformStyle({
      transform: "translate3d(0,0, 0px)",
    });
  }, []);

  return (
    <div className="dice-result">
      <div className={platformClass} style={platformStyle}>
        <div className="dice" onClick={dado} style={platformStyle1}>
          <div className="side front">
            <div className="dot center"></div>
          </div>
          <div className="side front inner"></div>
          <div className="side top">
            <div className="dot dtop dleft"></div>
            <div className="dot dbottom dright"></div>
          </div>
          <div className="side top inner"></div>
          <div className="side right">
            <div className="dot dtop dleft"></div>
            <div className="dot center"></div>
            <div className="dot dbottom dright"></div>
          </div>
          <div className="side right inner"></div>
          <div className="side left">
            <div className="dot dtop dleft"></div>
            <div className="dot dtop dright"></div>
            <div className="dot dbottom dleft"></div>
            <div className="dot dbottom dright"></div>
          </div>
          <div className="side left inner"></div>
          <div className="side bottom">
            <div className="dot center"></div>
            <div className="dot dtop dleft"></div>
            <div className="dot dtop dright"></div>
            <div className="dot dbottom dleft"></div>
            <div className="dot dbottom dright"></div>
          </div>
          <div className="side bottom inner"></div>
          <div className="side back">
            <div className="dot dtop dleft"></div>
            <div className="dot dtop dright"></div>
            <div className="dot dbottom dleft"></div>
            <div className="dot dbottom dright"></div>
            <div className="dot center dleft"></div>
            <div className="dot center dright"></div>
          </div>
          <div className="side back inner"></div>
          <div className="side cover x"></div>
          <div className="side cover y"></div>
          <div className="side cover z"></div>
        </div>
      </div>
    </div>
  );
};
export default DiceAnimation;
