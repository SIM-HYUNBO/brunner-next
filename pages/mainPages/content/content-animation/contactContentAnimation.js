`use strict`

import React, { Component } from 'react'
import Lottie from 'react-lottie-player'
import ContactContentAnimationJson from '/public/content-animation-json/contact-content-animation.json'

export default function ContactContentAnimation({ width, height }) {
  return (
    <Lottie
      loop
      animationData={ContactContentAnimationJson}
      play
      style={{ width: width, height: height }}  // 전달된 width와 height를 사용
    />
  )
}