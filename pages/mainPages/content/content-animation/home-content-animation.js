import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import HomeContentAnimationJson from '/public/home-content-animation.json'

export default function HomeContentAnimation() {
  return (
      <Lottie
        loop
        animationData={HomeContentAnimationJson}
        play
      />
  )
}