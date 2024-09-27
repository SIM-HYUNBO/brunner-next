`use strict`

import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import HomeContentAnimationJson from '/public/content-animation-json/home-content-animation.json'

export default function HomeContentAnimation() {
  return (
    <Lottie
      loop
      animationData={HomeContentAnimationJson}
      play
    />
  )
}