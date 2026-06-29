// src/hooks/useSignalR.js
import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

export function useSignalR() {
  const [latestImage, setLatestImage] = useState(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7084/mediaHub", {
        withCredentials: true, // matches AllowCredentials()
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveMedia", (imageUrl) => {
      setLatestImage(imageUrl);
    });

    connection.start().catch(console.error);

    return () => connection.stop();
  }, []);

  return latestImage;
}