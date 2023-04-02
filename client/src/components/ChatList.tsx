import { ScrollArea, Stack, Sx } from '@mantine/core';
import { Peer } from './CallPage';
import ChatBubble from './ChatBubble';
import { useEffect, useRef } from 'react';

type ChatItem = {
  author: Peer;
  message: string;
  timeStamp: number;
};

type ChatListProps = {
  chatItems: ChatItem[];
  sx?: Sx;
};

function ChatList({ chatItems, sx }: ChatListProps) {
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatItems]);

  return (
    <ScrollArea
      offsetScrollbars
      viewportRef={viewport}
      sx={{
        ...sx,
      }}
    >
      <Stack
        spacing={4}
        sx={{
          height: '100%',
          // overflow: 'auto',
          paddingRight: 4,
        }}
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
    </ScrollArea>
  );
}

export type { ChatItem };
export default ChatList;
