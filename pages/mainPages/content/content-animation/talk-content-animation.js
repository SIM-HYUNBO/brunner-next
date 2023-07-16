`use strict`

import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import TalkContentAnimationJson from '/public/talk-content-animation.json'

export default function TalkContentAnimation() {
  return (
    <Lottie
      loop
      animationData={TalkContentAnimationJson}
      play
    />
  )
}