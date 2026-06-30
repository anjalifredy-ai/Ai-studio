export default function TypingDots() {
  return (
    <div className="flex w-full justify-start">
      <div className="bg-panel2 border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
        <span className="dot w-2 h-2 rounded-full bg-textdim inline-block" />
        <span className="dot w-2 h-2 rounded-full bg-textdim inline-block" />
        <span className="dot w-2 h-2 rounded-full bg-textdim inline-block" />
      </div>
    </div>
  );
}