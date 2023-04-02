import { Box, Stack, Sx } from '@mantine/core';
import { Peer } from './CallPage';
import ChatBubble from './ChatBubble';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectChat } from '../state/chatSlice';

interface ChatItem {
  author: Peer;
  message: string;
  timeStamp: number;
}

interface ChatListProps {
  sx?: Sx;
}

function ChatList({ sx }: ChatListProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const chatItems = useSelector(selectChat).chatItems;

  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatItems]);

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        ...sx,
      }}
    >
      <Stack
        spacing={4}
        sx={{
          paddingRight: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          overflowY: 'auto',
          maxHeight: '100%',
          '&::-webkit-scrollbar': {
            width: '0.5rem',
          },

          '&::-webkit-scrollbar-thumb': {
            borderRadius: '0.625rem',
            background: 'rgba(255, 255, 255, 0.4)',
          },
        }}
        ref={viewport}
      >
        {chatItems.map((item, index) => {
          const prevItem = index > 0 ? chatItems[index - 1] : undefined;
          const nextItem =
            index < chatItems.length - 1 ? chatItems[index + 1] : undefined;

          return (
            <ChatBubble
              chatItem={item}
              prevItem={prevItem}
              nextItem={nextItem}
              key={index}
            />
          );
        })}
      </Stack>
    </Box>
  );
}

export type { ChatItem };
export default ChatList;
