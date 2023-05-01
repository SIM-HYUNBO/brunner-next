import { NextResponse } from 'next/server';

export default async function RequestServer(jRequest) {
  
  const res = await fetch(`http://localhost:8080/executeJson/${jRequest}`, {
    headers: {
      'Content-Type': 'application/json',
    //   'API-Key': process.env.DATA_API_KEY,
    },
  });

  const jResponse = await res.json();
  alert(JSON.stringify(jResponse));
  return NextResponse.json({ jResponse })
}