// src/hooks/useSignalR.js
import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { BASE_URL } from "../Services/mediaService";

export function useSignalR() {
  const [latestImage, setLatestImage] = useState(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/mediaHub`, {
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