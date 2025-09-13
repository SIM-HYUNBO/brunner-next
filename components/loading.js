"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import LottiePlayer from "@/components/lottiePlayer";

const LOTTIE_JSON = `{"v":"4.6.8","fr":29.9700012207031,"ip":0,"op":69.0000028104276,"w":256,"h":256,"nm":"Comp 1","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"Glow ball","ks":{"o":{"a":0,"k":100},"r":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":0,"s":[0],"e":[360]},{"t":69.0000028104276}]},"p":{"a":0,"k":[127.984,127.969,0]},"a":{"a":0,"k":[-0.182,32.385,0]},"s":{"a":0,"k":[132,132,100]}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[14.125,14.125]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse"},{"ty":"fl","c":{"a":0,"k":[0.1635217,0.8509804,0.8105415,1]},"o":{"a":0,"k":100},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill"},{"ty":"tr","p":{"a":0,"k":[-0.063,1.5],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group"}],"ip":0,"op":300.00001221925,"st":0,"bm":0,"sr":1},{"ddd":0,"ind":2,"ty":4,"nm":"Shape Layer 8","ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":315},"p":{"a":0,"k":[127.984,127.969,0]},"a":{"a":0,"k":[-0.182,32.385,0]},"s":{"a":1,"k":[{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":56,"s":[132,132,100],"e":[145,145,100]},{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":59,"s":[145,145,100],"e":[132,132,100]},{"t":63.0000025660426}]}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[14.125,14.125]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse"},{"ty":"fl","c":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":0,"s":[0.1647059,0.6313726,0.8509804,1],"e":[0.1647059,0.6313726,0.8509804,1]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":56,"s":[0.1647059,0.6313726,0.8509804,1],"e":[0.1647059,0.8509804,0.8117647,1]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":62,"s":[0.1647059,0.8509804,0.8117647,1],"e":[0.1647059,0.6313726,0.8509804,1]},{"t":69.0000028104276}]},"o":{"a":0,"k":100},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill"},{"ty":"tr","p":{"a":0,"k":[-0.063,1.5],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group"}],"ip":0,"op":300.00001221925,"st":0,"bm":0,"sr":1},{"ddd":0,"ind":3,"ty":4,"nm":"Shape Layer 7","ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":270},"p":{"a":0,"k":[127.984,127.969,0]},"a":{"a":0,"k":[-0.182,32.385,0]},"s":{"a":1,"k":[{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":48,"s":[132,132,100],"e":[145,145,100]},{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":51,"s":[145,145,100],"e":[132,132,100]},{"t":55.0000022401959}]}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[14.125,14.125]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse"},{"ty":"fl","c":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":0,"s":[0.1647059,0.6313726,0.8509804,1],"e":[0.1647059,0.6745098,0.8431373,1]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":47,"s":[0.1647059,0.6745098,0.8431373,1],"e":[0.1647059,0.8509804,0.8117647,1]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":58,"s":[0.1647059,0.8509804,0.8117647,1],"e":[0.1647059,0.6313726,0.8509804,1]},{"t":69.0000028104276}]},"o":{"a":0,"k":100},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill"},{"ty":"tr","p":{"a":0,"k":[-0.063,1.5],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group"}],"ip":0,"op":300.00001221925,"st":0,"bm":0,"sr":1},{"ddd":0,"ind":4,"ty":4,"nm":"Shape Layer 6","ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":225},"p":{"a":0,"k":[127.984,127.969,0]},"a":{"a":0,"k":[-0.182,32.385,0]},"s":{"a":1,"k":[{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":39,"s":[132,132,100],"e":[145,145,100]},{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":42,"s":[145,145,100],"e":[132,132,100]},{"t":46.0000018736184}]}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[14.125,14.125]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse"},{"ty":"fl","c":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":0,"s":[0.1647059,0.6313726,0.8509804,1],"e":[0.1647059,0.6313726,0.8509804,1]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":37,"s":[0.1647059,0.6313726,0.8509804,1],"e":[0.1647059,0.8509804,0.8117647,1]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":43,"s":[0.1647059,0.8509804,0.8117647,1],"e":[0.1647059,0.6313726,0.8509804,1]},{"t":48.0000019550801}]},"o":{"a":0,"k":100},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill"},{"ty":"tr","p":{"a":0,"k":[-0.063,1.5],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group"}],"ip":0,"op":300.00001221925,"st":0,"bm":0,"sr":1},{"ddd":0,"ind":5,"ty":4,"nm":"Shape Layer 5","ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":180},"p":{"a":0,"k":[127.984,127.969,0]},"a":{"a":0,"k":[-0.182,32.385,0]},"s":{"a":1,"k":[{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":31,"s":[132,132,100],"e":[145,145,100]},{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":34,"s":[145,145,100],"e":[132,132,100]},{"t":38.0000015477717}]}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[14.125,14.125]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse"},{"ty":"fl","c":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":0,"s":[0.1647059,0.6313726,0.8509804,1],"e":[0.1647059,0.6313726,0.8509804,1]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":26,"s":[0.1647059,0.6313726,0.8509804,1],"e":[0.1647059,0.8509804,0.8117647,1]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":38,"s":[0.1647059,0.8509804,0.8117647,1],"e":[0.1647059,0.6313726,0.8509804,1]},{"t":42.0000017106951}]},"o":{"a":0,"k":100},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill"},{"ty":"tr","p":{"a":0,"k":[-0.063,1.5],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group"}],"ip":0,"op":300.00001221925,"st":0,"bm":0,"sr":1},{"ddd":0,"ind":6,"ty":4,"nm":"Shape Layer 4","ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":135},"p":{"a":0,"k":[127.984,127.969,0]},"a":{"a":0,"k":[-0.182,32.385,0]},"s":{"a":1,"k":[{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":23,"s":[132,132,100],"e":[145,145,100]},{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":26,"s":[145,145,100],"e":[132,132,100]},{"t":30.0000012219251}]}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[14.125,14.125]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse"},{"ty":"fl","c":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":0,"s":[0.1647059,0.6313726,0.8509804,1],"e":[0.1647059,0.8509804,0.8117647,1]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":30,"s":[0.1647059,0.8509804,0.8117647,1],"e":[0.1647059,0.6313726,0.8509804,1]},{"t":38.0000015477717}]},"o":{"a":0,"k":100},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill"},{"ty":"tr","p":{"a":0,"k":[-0.063,1.5],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group"}],"ip":0,"op":300.00001221925,"st":0,"bm":0,"sr":1},{"ddd":0,"ind":7,"ty":4,"nm":"Shape Layer 3","ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":90},"p":{"a":0,"k":[127.984,127.969,0]},"a":{"a":0,"k":[-0.182,32.385,0]},"s":{"a":1,"k":[{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":14,"s":[132,132,100],"e":[145,145,100]},{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":17,"s":[145,145,100],"e":[132,132,100]},{"t":21.0000008553475}]}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[14.125,14.125]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse"},{"ty":"fl","c":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":0,"s":[0.1647059,0.6313726,0.8509804,1],"e":[0.1647059,0.8509804,0.8117647,1]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":22,"s":[0.1647059,0.8509804,0.8117647,1],"e":[0.1647059,0.6313726,0.8509804,1]},{"t":28.0000011404634}]},"o":{"a":0,"k":100},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill"},{"ty":"tr","p":{"a":0,"k":[-0.063,1.5],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group"}],"ip":0,"op":300.00001221925,"st":0,"bm":0,"sr":1},{"ddd":0,"ind":8,"ty":4,"nm":"Shape Layer 2","ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":45},"p":{"a":0,"k":[127.984,127.969,0]},"a":{"a":0,"k":[-0.182,32.385,0]},"s":{"a":1,"k":[{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":7,"s":[132,132,100],"e":[145,145,100]},{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":10,"s":[145,145,100],"e":[132,132,100]},{"t":14.0000005702317}]}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[14.125,14.125]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse"},{"ty":"fl","c":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":0,"s":[0.1647059,0.6313726,0.8509804,1],"e":[0.1647059,0.8509804,0.8117647,1]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":16,"s":[0.1647059,0.8509804,0.8117647,1],"e":[0.1647059,0.6313726,0.8509804,1]},{"t":22.0000008960784}]},"o":{"a":0,"k":100},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill"},{"ty":"tr","p":{"a":0,"k":[-0.063,1.5],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group"}],"ip":0,"op":300.00001221925,"st":0,"bm":0,"sr":1},{"ddd":0,"ind":9,"ty":4,"nm":"Shape Layer 1","ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[127.984,127.969,0]},"a":{"a":0,"k":[-0.182,32.385,0]},"s":{"a":1,"k":[{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":0,"s":[132,132,100],"e":[145,145,100]},{"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"n":["0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167","0p833_0p833_0p167_0p167"],"t":3,"s":[145,145,100],"e":[132,132,100]},{"t":7.00000028511585}]}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[14.125,14.125]},"p":{"a":0,"k":[0,0]},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse"},{"ty":"fl","c":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":0,"s":[0.1647059,0.6313726,0.8509804,1],"e":[0.1647059,0.8509804,0.8117647,1]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":5,"s":[0.1647059,0.8509804,0.8117647,1],"e":[0.1647059,0.6313726,0.8509804,1]},{"t":16.0000006516934}]},"o":{"a":0,"k":100},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill"},{"ty":"tr","p":{"a":0,"k":[-0.063,1.5],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group"}],"ip":0,"op":300.00001221925,"st":0,"bm":0,"sr":1}]}`;

export default function Loading() {
  const [overlayStyle, setOverlayStyle] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;

    const calculate = () => {
      try {
        const header = document.querySelector("header");
        const footer = document.querySelector("footer");

        const headerRect = header
          ? header.getBoundingClientRect()
          : { bottom: 0 };
        const footerRect = footer
          ? footer.getBoundingClientRect()
          : { top: document.documentElement.scrollHeight - window.scrollY };

        // 문서 좌표(절대값)
        const topDoc = Math.max(0, (headerRect.bottom || 0) + window.scrollY);
        const footerTopDoc =
          footerRect && typeof footerRect.top === "number"
            ? footerRect.top + window.scrollY
            : document.documentElement.scrollHeight;

        // 높이 (문서 좌표)
        const heightDoc = Math.max(0, footerTopDoc - topDoc);

        // 후보 컨테이너 우선 선택 (가능하면 .Layout, .container, main 등)
        const preferred = [
          ".Layout",
          ".container",
          "main .container",
          "main",
          "#__next",
          "body",
        ];
        let containerEl = null;
        for (const s of preferred) {
          const el = document.querySelector(s);
          if (el) {
            containerEl = el;
            break;
          }
        }

        // 만약 찾은 컨테이너가 화면 전체 너비(대부분 래퍼)라면,
        // 내부에서 더 '중앙 칼럼' 같은 요소를 찾아본다.
        let chosenRect = null;
        if (containerEl) {
          const crect = containerEl.getBoundingClientRect();
          // 화면 전체와 거의 같다면 내부 탐색 시도
          if (Math.abs(crect.width - window.innerWidth) < 20) {
            // 내부 후보들 중 header/footer에 걸치지 않고 너비가 적당한 요소 선택
            const children = Array.from(containerEl.querySelectorAll("*"));
            let best = null;
            for (const c of children) {
              const r = c.getBoundingClientRect();
              if (r.width < 80 || r.height < 20) continue;
              const cTopDoc = r.top + window.scrollY;
              const cBottomDoc = r.bottom + window.scrollY;
              if (cTopDoc > topDoc - 2 && cBottomDoc < footerTopDoc + 2) {
                // 너비가 화면보다 확연히 작고, 가능한 큰 너비 우선
                if (!best || r.width > best.width) best = r;
              }
            }
            if (best) chosenRect = best;
            else chosenRect = crect;
          } else {
            chosenRect = crect;
          }
        } else {
          chosenRect = { left: 0, width: window.innerWidth };
        }

        // 문서 좌표로 변환
        const leftDoc = (chosenRect.left || 0) + window.scrollX;
        const widthDoc = chosenRect.width || window.innerWidth;

        // 안전 클램프: topDoc/heightDoc이 음수/0이면 fallback
        if (heightDoc <= 0) {
          // fallback: 화면 전체에서 header/footer 뺀 높이 (viewport 기준)
          const fallbackTop = Math.max(0, headerRect.bottom || 0);
          const fallbackBottom = Math.min(
            window.innerHeight,
            footerRect.top || window.innerHeight
          );
          const fallbackHeight = Math.max(0, fallbackBottom - fallbackTop);
          setOverlayStyle({
            position: "fixed",
            top: `${fallbackTop}px`,
            left: `${Math.max(0, chosenRect.left || 0)}px`,
            width: `${Math.max(0, Math.min(window.innerWidth, chosenRect.width || window.innerWidth))}px`,
            height: `${fallbackHeight}px`,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(4px)",
            pointerEvents: "auto",
            boxSizing: "border-box",
          });
          return;
        }

        setOverlayStyle({
          position: "absolute",
          top: `${topDoc}px`,
          left: `${leftDoc}px`,
          width: `${widthDoc}px`,
          height: `${heightDoc}px`,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(4px)",
          pointerEvents: "auto",
          boxSizing: "border-box",
        });
      } catch (err) {
        // 실패해도 전체 화면 오버레이로 안전하게 처리
        setOverlayStyle({
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(4px)",
          pointerEvents: "auto",
          boxSizing: "border-box",
        });
      }
    };

    const tick = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(calculate);
    };

    // 초기 계산
    tick();

    // 리사이즈/스크롤/DOM 변경 시 재계산
    window.addEventListener("resize", tick, { passive: true });
    window.addEventListener("scroll", tick, { passive: true });
    const mo = new MutationObserver(tick);
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener("resize", tick);
      window.removeEventListener("scroll", tick);
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (typeof document === "undefined") return null;

  const overlayNode = (
    <div
      style={overlayStyle ?? { position: "fixed", inset: 0 }}
      className="z-50 justify-center items-center w-40 h-40"
    >
      <LottiePlayer
        jsonString={LOTTIE_JSON}
        width="200px"
        height="200px"
        opacityValue={1.0}
      />
    </div>
  );

  return createPortal(overlayNode, document.body);
}
