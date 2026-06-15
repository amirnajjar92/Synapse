import Image from 'next/image';

export default function AIIcon() {
  return (
    <Image
      src="/vectors/ai-icon.svg"
      alt="AI Icon"
      width={32}
      height={32}
      priority
    />
  );
}