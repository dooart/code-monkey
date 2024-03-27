import { UserIcon } from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";

export default function Message({ name, imageSrc, children }: { name: string; imageSrc: string; children: ReactNode }) {
  return (
    <div className="flex">
      <div className="border-4 border-r-0 border-primary shrink-0 h-[92px] rounded-l-2xl overflow-hidden">
        {!imageSrc ? (
          <div className="w-[84px] h-[84px] bg-primary flex items-center justify-center">
            <UserIcon size={32} className="text-white" />
          </div>
        ) : imageSrc.startsWith("http") ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={imageSrc} width={84} height={84} alt="User" />
        ) : (
          <Image src={imageSrc} width={84} height={84} alt="Code Monkey" />
        )}
      </div>
      <div className="px-4 p-3 bg-white border-4 rounded-r-2xl border-primary w-full overflow-x-scroll">
        <div className="font-heading tracking-tighter text-xl mb-2">{name}</div>
        <div className="min-w-24">{children}</div>
      </div>
    </div>
  );
}
