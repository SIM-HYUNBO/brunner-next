import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import ServiceContentAnimationJson from '/public/service-content-animation.json'

export default function ServiceContentAnimation() {
  return (
      <Lottie
        loop
        animationData={ServiceContentAnimationJson}
        play
      />
  )
}