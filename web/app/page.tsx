"use client";

import SendMessageForm from "@/components/send-message-form";
import SoulMessage from "@/components/soul-message";
import UserMessage from "@/components/user-message";
import { useOnMount } from "@/lib/hooks/use-on-mount";
import { Fragment, useRef, useState } from "react";
import { Soul, said } from "soul-engine/soul";

export type ChatMessage =
  | {
      type: "user";
      content: string;
    }
  | {
      type: "soul";
      content: string | AsyncIterable<string>;
    };

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { soul, isConnected } = useSoul((stream) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "soul",
        content: stream,
      },
    ]);
  });

  async function handleSendMessage(message: string) {
    if (!soul || !isConnected) {
      throw new Error("Soul not connected");
    }

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: message,
      },
    ]);

    await soul.dispatch(said("User", message));
  }

  return (
    <div className="py-6">
      <div className="mb-10 flex justify-between">
        <h1 className="text-3xl tracking-tighter">Code Monkey</h1>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="text-primary font-medium hover:underline">
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-col gap-6 pb-64">
        {messages.map((message, i) => (
          <Fragment key={i}>
            {message.type === "user" ? (
              <UserMessage>{message.content}</UserMessage>
            ) : (
              <SoulMessage content={message.content} />
            )}
          </Fragment>
        ))}
      </div>
      <div className="container max-w-screen-md fixed inset-x-0 bottom-0 w-full">
        <SendMessageForm isConnecting={!isConnected} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

function useSoul(onNewMessage: (stream: AsyncIterable<string>) => void) {
  const soulRef = useRef<Soul | undefined>(undefined);

  const [isConnected, setIsConnected] = useState(false);

  async function connect() {
    console.log("connecting soul...");

    const soulInstance = new Soul({
      organization: process.env.NEXT_PUBLIC_OPENSOULS_ORG!,
      blueprint: process.env.NEXT_PUBLIC_OPENSOULS_BLUEPRINT!,
    });

    soulInstance.on("says", async ({ stream }) => {
      onNewMessage(await stream());
    });

    await soulInstance.connect();
    console.log("soul connected");

    soulRef.current = soulInstance;
    setIsConnected(true);
  }

  async function disconnect() {
    if (soulRef.current) {
      await soulRef.current.disconnect();
      console.log("soul disconnected");
    }

    soulRef.current = undefined;
  }

  async function reconnect() {
    await disconnect();
    await connect();
  }

  useOnMount(() => {
    connect().catch(console.error);

    return () => {
      disconnect();
    };
  });

  return { soul: soulRef.current, isConnected, reconnect };
}
