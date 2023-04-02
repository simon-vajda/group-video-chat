import { Drawer } from '@mantine/core';
import ChatPanel from './ChatPanel';

type ChatDrawerProps = {
  opened: boolean;
  onClose: () => void;
};

function ChatDrawer({ opened, onClose }: ChatDrawerProps) {
  return (
    <Drawer.Root
      opened={opened}
      position="right"
      onClose={onClose}
      size="100%"
      zIndex={1000}
      style={{
        maxHeight: '100%',
      }}
    >
      <Drawer.Content
        sx={(theme) => ({
          backdropFilter: 'blur(20px)',
          background: theme.colors.dark[8] + 'E0',
        })}
      >
        <Drawer.Body
          sx={{
            height: '100vh',
          }}
        >
          <ChatPanel onClose={onClose} />
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
}

export default ChatDrawer;
