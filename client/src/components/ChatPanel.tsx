import {
  ActionIcon,
  Box,
  CloseButton,
  Divider,
  Flex,
  Group,
  Input,
  Sx,
  Title,
  useMantineTheme,
} from '@mantine/core';
import ChatList from './ChatList';
import { IoSend } from 'react-icons/io5';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addChatItem } from '../state/chatSlice';
import { selectUser } from '../state/userSlice';

interface ChatPanelProps {
  onSubmit: (message: string) => void;
  onClose: () => void;
  sx?: Sx;
}

function ChatPanel({ onSubmit, onClose, sx }: ChatPanelProps) {
  const theme = useMantineTheme();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [message, setMessage] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(message);
    dispatch(
      addChatItem({
        author: {
          id: 'local',
          name: user.name,
          index: -1,
          handRaised: false,
          reaction: {
            value: 'like',
            timeLeft: 0,
          },
        },
        message,
        timeStamp: Date.now(),
      }),
    );
    setMessage('');
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...sx,
      }}
    >
      <Group position="apart" m="sm">
        <Title order={3}>Messages</Title>
        <CloseButton size="md" onClick={() => onClose()} />
      </Group>

      <Divider />
      <ChatList
        sx={{
          flexGrow: 1,
          marginLeft: theme.spacing.sm,
          marginRight: 8,
          marginTop: theme.spacing.sm,
        }}
      />

      <form
        onSubmit={handleSubmit}
        style={{
          margin: theme.spacing.sm,
        }}
      >
        <Flex direction="row" align="center">
          <Input
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            ref={inputRef}
            sx={{
              flexGrow: 1,
            }}
          />
          <ActionIcon
            type="submit"
            size="lg"
            variant="transparent"
            color="blue"
            ml={theme.spacing.xs}
            disabled={message.trim().length === 0}
            onClick={() => inputRef.current?.focus()}
          >
            <IoSend size={20} />
          </ActionIcon>
        </Flex>
      </form>
    </Box>
  );
}

export default ChatPanel;
