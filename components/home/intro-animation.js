import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import IntroAnimationJson from '../../public/intro-animation.json'

export default function IntroAnimation() {
  return (
      <Lottie
        loop
        animationData={IntroAnimationJson}
        play
      />
  )
}