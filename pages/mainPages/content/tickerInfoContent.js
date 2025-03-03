`use strict`;

import { useState, useRef, useEffect } from "react";
import * as constants from "@/components/constants";

import RequestServer from "@/components/requestServer";
import Board from "@/pages/mainPages/content/boardContent";
import RealtimeChart from "./realtimeChart";
import DivContainer from "@/components/divContainer";
import GoverningMessage from "@/components/governingMessage";
import { useModal } from "@/components/brunnerModalUtils";

export default function TickerInfoContent({ tickerCode: tickerCode }) {

  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal } = useModal();

  const [tickerDesc, setTickerDesc] = useState("");
  const [brandingInfo, setBrandingInfo] = useState({});
  useEffect(() => {
    getTickerInfo();
  }, []);
  const tickerDescRef = useRef(tickerDesc);
  const setTickerDescRef = (newValue) => {
    setTickerDesc(newValue);
    tickerDescRef.current = newValue;
  };

  const [tickerInfoContent, setTickerInfoContent] = useState("");
  const tickerInfoContentRef = useRef(tickerInfoContent);
  const settickerInfoContentRef = (newValue) => {
    setTickerInfoContent(newValue);
    tickerInfoContentRef.current = newValue;
  };

  const getTickerInfo = async () => {
    try {
      const jRequest = {
        commandName: constants.commands.COMMAND_STOCK_GET_TICKER_INFO,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        tickerCode: tickerCode,
      };

      setLoading(true);
      const jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false);

      if (jResponse.error_code === 0) {
        if (jResponse.tickerInfo) {
          setTickerDescRef(jResponse.tickerInfo.tickerDesc);
          settickerInfoContentRef(
            convertJsonToPlainText(jResponse.tickerInfo.tickerInfoContent)
          );

          for (let key in jResponse.tickerInfo.tickerInfoContent) {
            const value = jResponse.tickerInfo.tickerInfoContent[key];
            if (key === "branding") {
              var tmpBrandingInfo = {};
              tmpBrandingInfo.logo_url = `${jResponse.tickerInfo.tickerInfoContent[key]["logo_url"]}?apikey=${jResponse.apikey}`;
              tmpBrandingInfo.icon_url = `${jResponse.tickerInfo.tickerInfoContent[key]["icon_url"]}?apikey=${jResponse.apikey}`;
              setBrandingInfo(tmpBrandingInfo);
            }
          }
        }
      } else {
        setLoading(false);
        openModal(JSON.stringify(jResponse.error_message));
      }
    } catch (err) {
      setLoading(false);
      openModal(err instanceof Error ? err.message : constants.messages.MESSAGE_UEO);
    }
  };

  function convertJsonToPlainText(jsonObject) {
    return Object.entries(jsonObject)
      .map(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          // 객체 값을 문자열로 변환하고 콤마와 따옴표를 제거
          const formattedObject = JSON.stringify(value, null, 2)
            .replace(/"([^"]+)":/g, "$1:") // 키의 따옴표 제거
            .replace(/"([^"]+)"/g, "$1") // 값의 따옴표 제거
            .replace(/,\s*([\]}])/g, "$1") // 마지막 콤마 제거
            .replace(/^\{\n/, "") // 시작 중괄호 및 줄바꿈 제거
            .replace(/\n\}$/, ""); // 마지막 중괄호 및 줄바꿈 제거
          return `${key}: \n${formattedObject}`;
        }
        return `${key}: ${value}`;
      })
      .join("\n"); // 항목 간에 줄바꿈을 두 번 추가하여 구분
  }

  // 현재 가격
  const [currentPrice, setCurrentPrice] = useState();
  const currentPriceRef = useRef(currentPrice);

  const updateCurrentPrice = (firstData, lastData, newData) => {
    var textColor = "";

    if (firstData?.y == newData?.y) textColor = "text-gray-500";
    else if (firstData?.y > newData?.y) textColor = "text-blue-500";
    else textColor = "text-red-500";

    currentPriceRef.current = newData?.y;
    setCurrentPrice(newData?.y);
    setCurrentPriceTextColorRef(textColor);
  };

  // 현재가격 표시 색깔
  const currentPriceTextColorRef = useRef(null);
  const setCurrentPriceTextColorRef = (newValue) => {
    currentPriceTextColorRef.current.classList.remove("text-gray-500");
    currentPriceTextColorRef.current.classList.remove("text-red-500");
    currentPriceTextColorRef.current.classList.remove("text-blue-500");

    currentPriceTextColorRef.current.classList.add(newValue);
  };

  return (
    <>
      <BrunnerMessageBox />
      <DivContainer>
        <div className="flex flex-col text-left item-start">
          <h2 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
            {`${tickerCode}`}
          </h2>
          <GoverningMessage>
            <img src={brandingInfo.icon_url} alt="" />
            <h2>{tickerDescRef.current}</h2>
          </GoverningMessage>
          <input
            ref={currentPriceTextColorRef}
            className={`text-center text-5xl text-gray bg-slate-50 dark:bg-slate-800 border border-slate-400 mt-10 mb-2 h-100 w-[100%] px-5 py-3`}
            type="text"
            value={currentPriceRef.current ? `${currentPriceRef.current}` : ``}
          />
          <button
            className="bg-indigo-500 text-white py-2 px-4 h-10 mb-5"
            type="submit"
            onClick={() => {
              getTickerInfo();
            }}
          >
            Refresh
          </button>
          <RealtimeChart
            updateCurrentPrice={updateCurrentPrice}
          ></RealtimeChart>
          <div className="flex space-x-4 border w-full h-full sm:max-w-full text-align-left m-5 readonly">
            <pre>
              {tickerInfoContentRef.current
                ? tickerInfoContentRef.current
                : "Ticker news here."}
            </pre>
          </div>
          <div className="flex space-x-4 border w-full h-full text-align-left mt-10 readonly">
            <Board boardType={tickerCode} />
          </div>
        </div>
        <div className="lg:h-2/6 lg:w-2/6 border w-100 h-100 flex flex-col justify-center items-center">
          <img src={brandingInfo.logo_url} className="mt-5" alt="" />
        </div>
      </DivContainer>
    </>
  );
}
