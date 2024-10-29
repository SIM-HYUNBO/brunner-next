`use strict`

import React, { Component , useEffect} from 'react'
import ContactContentAnimationJson from '/public/content-animation-json/admin-content-animation.json'

const Lottie = () => {
  useEffect(() => {
    const player = document.getElementById('lottie-player');
    if (player) {
      player.load('path/to/your/animation.json');
    }
  }, []);
}

export default function AdminContentAnimation({ width, height }) {
  return (
    <Lottie
      loop
      animationData={ContactContentAnimationJson}
      play
      style={{ width: width, height: height }}  // 전달된 width와 height를 사용
    />
  )
}