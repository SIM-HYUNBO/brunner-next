'use client'

import React, { useEffect} from 'react'
import dynamic from 'next/dynamic';

const Lottie = dynamic (() => import("lottie-react"), {ssr: false});

import HomeContentAnimationJson from "/public/content-animation-json/home-content-animation.json"

export default function HomeContentAnimation({ width, height }) {

  return (
    <Lottie
      loop
      autoplay
      animationData={HomeContentAnimationJson}
      style={{ width: width, height: height }}  // 전달된 width와 height를 사용
    />
  )
}