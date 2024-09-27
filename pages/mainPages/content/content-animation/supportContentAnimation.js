`use strict`

import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import ContactContentAnimationJson from '/public/content-animation-json/contact-content-animation.json'

export default function ContactContentAnimation() {
  return (
    <Lottie
      loop
      animationData={ContactContentAnimationJson}
      play
    />
  )
}