import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import BoardIntroAnimationJson from '../../public/board-intro-animation.json'

export default function BoardIntroAnimation() {
  return (
      <Lottie
        loop
        animationData={BoardIntroAnimationJson}
        play
      />
  )
}