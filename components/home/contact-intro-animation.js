import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import ContactIntroAnimationJson from '../../public/contact-intro-animation.json'

export default function ContactIntroAnimation() {
  return (
      <Lottie
        loop
        animationData={ContactIntroAnimationJson}
        play
      />
  )
}