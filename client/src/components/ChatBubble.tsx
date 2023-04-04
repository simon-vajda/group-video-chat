import {
  Box,
  Flex,
  Paper,
  Text,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { ChatItem } from './ChatList';
import moment from 'moment';

function getBubbleRadius(
  ownMessage: boolean,
  hasPrevious: boolean,
  hasNext: boolean,
) {
  const sm = '4px';
  const lg = '16px';

  if (ownMessage) {
    if (hasPrevious && hasNext) {
      return `${lg} ${sm} ${sm} ${lg}`;
    }
    if (hasPrevious) {
      return `${lg} ${sm} ${lg} ${lg}`;
    }
    if (hasNext) {
      return `${lg} ${lg} ${sm} ${lg}`;
    }

    return `${lg} ${lg} ${lg} ${lg}`;
  } else {
    if (hasPrevious && hasNext) {
      return `${sm} ${lg} ${lg} ${sm}`;
    }
    if (hasPrevious) {
      return `${sm} ${lg} ${lg} ${lg}`;
    }
    if (hasNext) {
      return `${lg} ${lg} ${lg} ${sm}`;
    }

    return `${lg} ${lg} ${lg} ${lg}`;
  }
}

type ChatBubbleProps = {
  chatItem: ChatItem;
  prevItem?: ChatItem;
  nextItem?: ChatItem;
};

const SESSION_TIMEOUT = 120000;

function ChatBubble({ chatItem, prevItem, nextItem }: ChatBubbleProps) {
  const theme = useMantineTheme();

  const ownMessage = chatItem.author.id === 'local';
  const sessionStart =
    chatItem.timeStamp - (prevItem?.timeStamp || 0) > SESSION_TIMEOUT;
  const sessionEnd =
    nextItem && nextItem.timeStamp - chatItem.timeStamp > SESSION_TIMEOUT;
  const hasPrevious =
    !sessionStart && prevItem?.author.id === chatItem.author.id;
  const hasNext = !sessionEnd && nextItem?.author.id === chatItem.author.id;
  const timeStamp = moment(chatItem.timeStamp).format('HH:mm');

  return (
    <Box
      sx={{
        textAlign: 'center',
      }}
    >
      {sessionStart && (
        <Text c="dimmed" fz="xs" mt={4}>
          {timeStamp}
        </Text>
      )}
      <Flex
        direction="column"
        align={ownMessage ? 'flex-end' : 'flex-start'}
        w="100%"
      >
        {!hasPrevious && !ownMessage && (
          <Text
            fz="sm"
            sx={{
              display: 'inline-block',
              marginLeft: 8,
              marginBottom: 2,
              marginTop: 6,
              whiteSpace: 'pre-wrap',
            }}
          >
            {chatItem.author.name}
          </Text>
        )}
        <Tooltip label={timeStamp}>
          <Paper
            sx={{
              backgroundColor: ownMessage
                ? theme.colors.blue[8]
                : theme.colors.dark[4],
              color: theme.white,
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: getBubbleRadius(ownMessage, hasPrevious, hasNext),
              maxWidth: '80%',
              marginTop: !hasPrevious && ownMessage ? 8 : 0,
            }}
          >
            <Text
              align="start"
              sx={{
                whiteSpace: 'pre-wrap',
              }}
            >
              {chatItem.message}
            </Text>
          </Paper>
        </Tooltip>
      </Flex>
    </Box>
  );
}

export default ChatBubble;
