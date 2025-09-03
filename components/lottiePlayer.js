import React, { useMemo } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(()=> import("lottie-react"), { ssr : false});

export default function LottiePlayer({ jsonString, width, height, loop = true, autoplay = true }) {
  // 문자열 → 객체 변환 (잘못된 JSON일 경우 대비)
  const animationData = useMemo(() => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Invalid JSON string:", e);
      return null;
    }
  }, [jsonString]);

  if (!animationData) {
    return <div style={{ color: "red" }}>❌ 잘못된 JSON 애니메이션 데이터</div>;
  }

  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      style={{ width, height }}
    />
  );
}