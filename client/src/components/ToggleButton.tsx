import { ActionIcon } from '@mantine/core';
import { useState } from 'react';
import { IconType } from 'react-icons/lib';

interface Props {
  onClick: (turnedOn: boolean) => void;
  onIcon: JSX.Element;
  offIcon: JSX.Element;
}

function ToggleButton({ onClick, onIcon, offIcon }: Props) {
  const [turnedOn, setTurnedOn] = useState(true);

  const handleClick = () => {
    const value = !turnedOn;
    setTurnedOn(value);
    onClick(value);
  };

  return (
    <ActionIcon
      size="xl"
      radius="xl"
      variant="filled"
      color={turnedOn ? 'gray' : 'gray'}
      onClick={handleClick}
    >
      {turnedOn ? onIcon : offIcon}
    </ActionIcon>
  );
}

export default ToggleButton;
