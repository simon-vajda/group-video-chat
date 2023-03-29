type EmojiProps = {
  label: string;
  symbol: string;
  size?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
};

function Emoji({ label, symbol, size, shadow, style }: EmojiProps) {
  return (
    <span
      className="emoji"
      role="img"
      aria-label={label ? label : ''}
      aria-hidden={label ? 'false' : 'true'}
      style={{
        fontSize: size,
        filter: shadow ? 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))' : '',
        ...style,
      }}
    >
      {symbol}
    </span>
  );
}

export default Emoji;
