import {
  Box,
  Flex,
  Paper,
  Text,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { ChatItem } from '../state/callSlice';
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

function replaceUrlsWithLinks(text: string): JSX.Element[] {
  const results: JSX.Element[] = [];
  const urlRegex =
    /(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/gm;

  let match;
  let lastIndex = 0;
  while ((match = urlRegex.exec(text)) !== null) {
    results.push(<>{text.substring(lastIndex, match.index)}</>);
    results.push(
      <a
        href={match[0]}
        target="_blank"
        rel="noreferrer"
        style={{
          color: 'inherit',
          font: 'inherit',
          textDecoration: 'underline 1px',
        }}
      >
        {match[0]}
      </a>,
    );
    lastIndex = urlRegex.lastIndex;
  }
  results.push(<>{text.substring(lastIndex)}</>);

  return results;
}

function ChatBubble({ chatItem, prevItem, nextItem }: ChatBubbleProps) {
  const theme = useMantineTheme();

  const ownMessage = chatItem.authorId === 'local';
  const sessionStart =
    chatItem.timeStamp - (prevItem?.timeStamp || 0) > SESSION_TIMEOUT;
  const sessionEnd =
    nextItem && nextItem.timeStamp - chatItem.timeStamp > SESSION_TIMEOUT;
  const hasPrevious = !sessionStart && prevItem?.authorId === chatItem.authorId;
  const hasNext = !sessionEnd && nextItem?.authorId === chatItem.authorId;
  const timeStamp = moment(chatItem.timeStamp).format('HH:mm');

  return (
    <Box
      sx={{
        textAlign: 'center',
        marginTop: !hasPrevious && !ownMessage ? 8 : 0,
      }}
    >
      {sessionStart && (
        <Text c="dimmed" fz="xs" mt={8} mb={8}>
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
              marginTop: sessionStart ? 0 : 6,
              marginBottom: 2,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
            }}
          >
            {chatItem.author}
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
              marginTop: ownMessage && !sessionStart && !hasPrevious ? 8 : 0,
            }}
          >
            <Text
              align="start"
              sx={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
              }}
            >
              {replaceUrlsWithLinks(chatItem.message)}
            </Text>
          </Paper>
        </Tooltip>
      </Flex>
    </Box>
  );
}

export default ChatBubble;
