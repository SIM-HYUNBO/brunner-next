import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import ServiceIntroAnimationJson from '../../public/service-intro-animation.json'

export default function ServiceIntroAnimation() {
  return (
      <Lottie
        loop
        animationData={ServiceIntroAnimationJson}
        play
      />
  )
}