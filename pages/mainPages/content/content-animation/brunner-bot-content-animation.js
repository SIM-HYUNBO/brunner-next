import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import BrunnerBotContentAnimationJson from '/public/brunner-bot-content-animation.json'

export default function BrunnerBotContentAnimation() {
  return (
    <Lottie
      loop
      animationData={BrunnerBotContentAnimationJson}
      play
    />
  )
}