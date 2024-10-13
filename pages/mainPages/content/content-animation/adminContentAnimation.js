`use strict`

import React, { Component } from 'react'
import Lottie from 'react-lottie-player'
import AdminContentAnimationJson from '/public/content-animation-json/admin-content-animation.json'

export default function AdminContentAnimation({ width, height }) {
  return (
    <Lottie
      loop
      animationData={ContactContentAnimationJson}
      play
      style={{ width: width, height: height }}  // 전달된 width와 height를 사용
    />
  )
}