import { ActionIcon, Group, Popover } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import {
  TbHandStop,
  TbMoodSmile,
  TbThumbDownFilled,
  TbThumbUpFilled,
} from 'react-icons/tb';
import Emoji from './Emoji';

type Reaction =
  | 'like'
  | 'clapping'
  | 'heart'
  | 'laughing'
  | 'surprised'
  | 'dislike';

function ReactionSelector() {
  const [open, setOpen] = useState(false);

  function handleReaction(reaction: Reaction) {
    console.log(reaction);
    setOpen(false);
  }

  return (
    <Popover
      position="top"
      shadow="md"
      opened={open}
      onChange={setOpen}
      radius="xl"
    >
      <Popover.Target>
        <ActionIcon
          variant="filled"
          size="xl"
          onClick={() => setOpen((o) => !o)}
        >
          <TbMoodSmile size={24} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown sx={{ padding: 5 }}>
        <Group spacing={4}>
          <ActionIcon
            size="xl"
            radius="xl"
            onClick={() => handleReaction('like')}
          >
            <Emoji symbol="👍" label="thumbs up" size={24} />
          </ActionIcon>
          <ActionIcon
            size="xl"
            radius="xl"
            onClick={() => handleReaction('clapping')}
          >
            <Emoji symbol="👏" label="clapping" size={24} />
          </ActionIcon>
          <ActionIcon
            size="xl"
            radius="xl"
            onClick={() => handleReaction('heart')}
          >
            <Emoji symbol="❤️" label="heart" size={24} />
          </ActionIcon>
          <ActionIcon
            size="xl"
            radius="xl"
            onClick={() => handleReaction('laughing')}
          >
            <Emoji symbol="😂" label="laughing" size={24} />
          </ActionIcon>
          <ActionIcon
            size="xl"
            radius="xl"
            onClick={() => handleReaction('surprised')}
          >
            <Emoji symbol="😮" label="surprised" size={24} />
          </ActionIcon>
          <ActionIcon
            size="xl"
            radius="xl"
            onClick={() => handleReaction('dislike')}
          >
            <Emoji symbol="👎" label="thumbs down" size={24} />
          </ActionIcon>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}

export default ReactionSelector;
