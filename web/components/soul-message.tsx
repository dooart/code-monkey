import { useEffect, useState } from "react";
import { Markdown } from "./markdown";
import Message from "./message";

export default function SoulMessage({ content }: { content: string | AsyncIterable<string> }) {
  const message = useContentWithStreaming(content);

  return (
    <Message name="Code Monkey" imageSrc="/code-monkey.webp">
      {message.length ? <Markdown>{message}</Markdown> : <span className="text-muted-foreground">Thinking...</span>}
    </Message>
  );
}

function useContentWithStreaming(content: string | AsyncIterable<string>) {
  const isStream = typeof content !== "string";
  const [message, setMessage] = useState(isStream ? "" : content);

  useEffect(() => {
    const readStream = async () => {
      if (!isStream) return;

      for await (const delta of content) {
        if (typeof delta === "string") {
          setMessage((prev) => prev + delta);
        }
      }
    };

    readStream();
  }, [content, isStream]);

  return message;
}
