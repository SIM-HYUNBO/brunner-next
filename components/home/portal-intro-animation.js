import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import PortalIntroAnimationJson from '../../public/portal-intro-animation.json'

export default function PortalIntroAnimation() {
  return (
      <Lottie
        loop
        animationData={PortalIntroAnimationJson}
        play
      />
  )
}