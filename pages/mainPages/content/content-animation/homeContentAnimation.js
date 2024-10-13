`use strict`

import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import HomeContentAnimationJson from '/public/content-animation-json/home-content-animation.json'

export default function HomeContentAnimation({ width, height }) {
  return (
    <Lottie
      loop
      animationData={HomeContentAnimationJson}
      play
      style={{ width: width, height: height }}  // 전달된 width와 height를 사용
    />
  )
}