import Message from "./message";

export default function UserMessage({ children }: { children: string }) {
  return (
    <Message name="You" imageSrc={process.env.NEXT_PUBLIC_USER_AVATAR!}>
      {children}
    </Message>
  );
}
