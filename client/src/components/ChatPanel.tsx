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
import ChatList, { ChatItem } from './ChatList';
import { IoSend } from 'react-icons/io5';
import { useState } from 'react';

type ChatPanelProps = {
  onClose: () => void;
  sx?: Sx;
};

function ChatPanel({ onClose, sx }: ChatPanelProps) {
  const theme = useMantineTheme();
  const [message, setMessage] = useState<string>('');
  const [chatItems, setChatItems] = useState<ChatItem[]>([]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      <Group position="apart">
        <Title order={3}>Messages</Title>
        <CloseButton size="md" onClick={() => onClose()} />
      </Group>

      <Divider mt="sm" mb="md" />
      <ChatList chatItems={chatItems} sx={{ flexGrow: 1 }} />

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: theme.spacing.md,
        }}
      >
        <Flex direction="row" align="center">
          <Input
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
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
            disabled={message.length === 0}
          >
            <IoSend size={20} />
          </ActionIcon>
        </Flex>
      </form>
    </Box>
  );
}

export default ChatPanel;
