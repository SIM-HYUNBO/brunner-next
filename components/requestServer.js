import { NextResponse } from 'next/server';

export default async function RequestServer(jRequest) {
  
  const serverIp='112.156.201.62'; 
  const serverPort=8080;
  const res = await fetch(`http://${serverIp}:${serverPort}/executeJson/${jRequest}`, {
    headers: {
      'Content-Type': 'application/json',
    //   'API-Key': process.env.DATA_API_KEY,
    },
  });

  const jResponse = await res.json();
  alert(JSON.stringify(jResponse));
  return NextResponse.json({ jResponse })
}