import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import SupportContentAnimationJson from '/public/support-content-animation.json'

export default function SupportContentAnimation() {
  return (
      <Lottie
        loop
        animationData={SupportContentAnimationJson}
        play
      />
  )
}