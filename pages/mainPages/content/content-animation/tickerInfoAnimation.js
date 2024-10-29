`use strict`

import React, { Component , useEffect} from 'react'
import TickerInfoAnimationJson from '/public/content-animation-json/ticker-info-animation.json'

const Lottie = () => {
  useEffect(() => {
    const player = document.getElementById('lottie-player');
    if (player) {
      player.load('path/to/your/animation.json');
    }
  }, []);
}

export default function TickerInfoAnimation() {
  return (
    <Lottie
      loop
      animationData={TickerInfoAnimationJson}
      play
    />
  )
}