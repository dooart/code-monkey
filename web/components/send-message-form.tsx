import { cn } from "@/lib/utils";
import { useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";

export default function SendMessageForm({
  isConnecting,
  onSendMessage,
}: {
  isConnecting?: boolean;
  onSendMessage: (message: string) => Promise<void>;
}) {
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    const value = message.trim();
    if (!value) return;

    setMessage("");
    await onSendMessage(value);
  };

  return (
    <form
      className="flex gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <ReactTextareaAutosize
        autoFocus
        maxRows={8}
        rows={1}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type here!"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        className={cn(
          "w-full text-lg bg-white rounded-2xl rounded-b-none border-4 border-primary border-b-0 p-4",
          "resize-none focus-visible:outline-none"
        )}
      />
      <button
        disabled={isConnecting || !message.trim()}
        type="submit"
        className={cn(
          "h-14 text-lg text-primary px-4 font-medium bg-white border-primary border-4 shadow-[0px_4px_0px_#000] rounded-2xl",
          "transition-transform",
          "disabled:opacity-50 disabled:mt-0",
          "[&:not(:disabled):hover]:scale-110 [&:not(:disabled):hover]:rotate-6",
          "[&:not(:disabled):focus]:scale-110 [&:not(:disabled):focus]:rotate-6 focus-visible:outline-none",
          "[&:not(:disabled):active]:shadow-none [&:not(:disabled):active]:mt-1"
        )}
      >
        Send
      </button>
    </form>
  );
}
