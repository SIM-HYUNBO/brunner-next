import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import SupportIntroAnimationJson from '../../public/support-intro-animation.json'

export default function SupportIntroAnimation() {
  return (
      <Lottie
        loop
        animationData={SupportIntroAnimationJson}
        play
      />
  )
}