`use strict`

import React, { Component } from 'react'
import Lottie from 'react-lottie-player'

import TickerInfoAnimationJson from '@/public/ticker-info-animation.json'

export default function TickerInfoAnimation() {
  return (
    <Lottie
      loop
      animationData={TickerInfoAnimationJson}
      play
    />
  )
}