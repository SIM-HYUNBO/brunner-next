`use strict`

import React, { Component } from 'react'
import Lottie from 'react-lottie-player'
import AdminContentAnimationJson from '/public/content-animation-json/admin-content-animation.json'

export default function AdminContentAnimation() {
  return (
    <Lottie
      loop
      animationData={AdminContentAnimationJson}
      play
    />
  )
}