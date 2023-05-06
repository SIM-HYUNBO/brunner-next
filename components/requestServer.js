export default async function RequestServer(jRequest) {
  
  const serverIp='112.156.201.62'; 
  const serverPort=8443;
  const res = await fetch(`https://${serverIp}:${serverPort}/executeJson/${jRequest}`, {
    headers: {
      'Content-Type': 'application/json'
    },
  });

  const jResponse = await res.json();
  return jResponse;
}