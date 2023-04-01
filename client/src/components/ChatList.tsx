import { Stack } from '@mantine/core';
import { Peer } from './CallPage';
import ChatBubble from './ChatBubble';

type ChatItem = {
  author: Peer;
  message: string;
  timeStamp: number;
};

type ChatListProps = {
  chatItems: ChatItem[];
};

function ChatList({ chatItems }: ChatListProps) {
  return (
    <Stack>
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
  );
}

export type { ChatItem };
export default ChatList;
