import { useMantineTheme } from '@mantine/core';
import ChatPanel from './ChatPanel';
import Modal from 'react-modal';

interface ChatDialogProps {
  opened: boolean;
  onSubmit: (message: string) => void;
  onClose: () => void;
}

function ChatDialog({ opened, onSubmit, onClose }: ChatDialogProps) {
  const theme = useMantineTheme();

  return (
    <Modal
      isOpen={opened}
      shouldCloseOnEsc
      contentLabel="Chat panel"
      style={{
        overlay: {
          backgroundColor: 'transparent',
          zIndex: 1000,
        },
        content: {
          inset: 0,
          backdropFilter: 'blur(20px)',
          background: theme.colors.dark[8] + 'E0',
          border: 'none',
          padding: 0,
        },
      }}
    >
      <ChatPanel onSubmit={onSubmit} onClose={onClose} />
    </Modal>
  );
}

export default ChatDialog;
