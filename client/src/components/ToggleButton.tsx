import { ActionIcon } from '@mantine/core';

interface Props {
  onClick: (turnedOn: boolean) => void;
  onIcon: JSX.Element;
  offIcon: JSX.Element;
  value: boolean;
}

function ToggleButton({ onClick, onIcon, offIcon, value }: Props) {
  const handleClick = () => {
    onClick(!value);
  };

  return (
    <ActionIcon
      size="xl"
      radius="xl"
      variant="filled"
      color={value ? 'gray' : 'gray'}
      onClick={handleClick}
    >
      {value ? onIcon : offIcon}
    </ActionIcon>
  );
}

export default ToggleButton;
