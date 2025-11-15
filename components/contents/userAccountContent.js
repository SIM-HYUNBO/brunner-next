`use strict`;

import { useState, useRef, useEffect } from "react";
import { useDeviceType } from "@/components/core/commonFunctions";
import GoverningMessage from "@/components/core/client/governingMessage";
import LottiePlayer from "@/components/core/client/lottiePlayer";
import UserAccountInfo from "../core/client/userAccountInfo";

export default function UserAccountContent() {
  const { isMobile, isTablet } = useDeviceType();

  return (
    <>
      <div>
        <div className={`w-full items-start text-left`}>
          <h2 className={`page-title`}>User Account</h2>
          <div className={`items-center`}>
            <LottiePlayer
              jsonString={`{
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 200,
  "h": 200,
  "nm": "AccountIcon_Pulse",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Account Icon Layer",
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100, "ix": 11 },
        "r": { "a": 0, "k": 0, "ix": 10 },
        "p": { "a": 0, "k": [100, 100, 0], "ix": 2 },
        "a": { "a": 0, "k": [0, 0, 0], "ix": 1 },
        "s": {
          "a": 1,
          "k": [
            {
              "t": 0,
              "s": [90, 90, 100],
              "e": [100, 100, 100],
              "i": { "x": [0.667], "y": [1] },
              "o": { "x": [0.333], "y": [0] }
            },
            { "t": 30, "s": [100, 100, 100], "e": [90, 90, 100] }
          ],
          "ix": 6
        }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "nm": "Head & Body",
          "it": [
            {
              "ty": "el",
              "p": { "a": 0, "k": [0, -26], "ix": 3 },
              "s": { "a": 0, "k": [40, 40], "ix": 2 },
              "nm": "Head"
            },
            {
              "ty": "rc",
              "p": { "a": 0, "k": [0, 18], "ix": 3 },
              "s": { "a": 0, "k": [64, 40], "ix": 2 },
              "r": { "a": 0, "k": 18, "ix": 4 },
              "nm": "Body"
            },
            {
              "ty": "fl",
              "c": { "a": 0, "k": [0.13, 0.59, 0.95, 1], "ix": 4 },
              "o": { "a": 0, "k": 100, "ix": 5 },
              "r": 1,
              "nm": "Fill"
            },
            {
              "ty": "tr",
              "p": { "a": 0, "k": [0, 0], "ix": 2 },
              "a": { "a": 0, "k": [0, 0], "ix": 1 },
              "s": { "a": 0, "k": [100, 100], "ix": 3 },
              "r": { "a": 0, "k": 0, "ix": 6 },
              "o": { "a": 0, "k": 100, "ix": 7 },
              "sk": { "a": 0, "k": 0, "ix": 4 },
              "sa": { "a": 0, "k": 0, "ix": 5 },
              "nm": "Transform"
            }
          ],
          "nm": "HeadBody Group"
        }
      ],
      "ip": 0,
      "op": 60,
      "st": 0,
      "bm": 0
    }
  ],
  "markers": []
}
`}
              width={400}
              height={300}
              loop={true}
              autoplay={true}
            />
          </div>
          <div className={`flex justify-center mt-5`}>
            <UserAccountInfo />
          </div>
        </div>
      </div>
    </>
  );
}
