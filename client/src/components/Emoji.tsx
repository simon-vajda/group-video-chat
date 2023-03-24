type EmojiProps = {
  label: string;
  symbol: string;
  size?: number;
};

function Emoji({ label, symbol, size }: EmojiProps) {
  return (
    <span
      className="emoji"
      role="img"
      aria-label={label ? label : ''}
      aria-hidden={label ? 'false' : 'true'}
      style={{ fontSize: size }}
    >
      {symbol}
    </span>
  );
}

export default Emoji;
