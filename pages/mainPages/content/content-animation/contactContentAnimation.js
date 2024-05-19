import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

`use strict`

import ContactContentAnimationJson from '/public/contact-content-animation.json'

export default function ContactContentAnimation() {
  return (
    <Lottie
      loop
      animationData={ContactContentAnimationJson}
      play
    />
  )
}