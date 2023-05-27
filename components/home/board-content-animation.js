import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import BoardContentAnimationJson from '../../public/board-content-animation.json'

export default function BoardContentAnimation() {
  return (
      <Lottie
        loop
        animationData={BoardContentAnimationJson}
        play
      />
  )
}