import { Group, ActionIcon, Button, Text, Menu } from '@mantine/core';
import {
  TbShare2,
  TbHandStop,
  TbMicrophone,
  TbMicrophoneOff,
  TbVideo,
  TbVideoOff,
  TbMessage,
  TbDotsVertical,
  TbPhoneX,
  TbLink,
} from 'react-icons/tb';
import { selectCall, setHandRaised, toggleChatOpen } from '../state/callSlice';
import {
  selectUserMedia,
  toggleAudio,
  toggleVideo,
} from '../state/userMediaSlice';
import ReactionSelector, { Reaction } from './ReactionSelector';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import RtcClient from '../rtcClient';
import { useMediaQuery } from '@mantine/hooks';

interface ControlBarProps {
  rtcClient: RtcClient;
  onReaction: (reaction: Reaction) => void;
}

function ControlBar({ rtcClient, onReaction }: ControlBarProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { id: roomId } = useParams();
  const userMedia = useSelector(selectUserMedia);
  const { handRaised } = useSelector(selectCall);

  const xs = useMediaQuery('(max-width: 20em)');
  const sm = useMediaQuery('(max-width: 24em)');
  const md = useMediaQuery('(max-width: 42em)');

  function copyShareLink() {
    const roomLink =
      window.location.protocol +
      '//' +
      window.location.host +
      `/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    notifications.show({
      title: 'Link copied',
      message: 'The room link has been copied to your clipboard',
      autoClose: 1500,
      icon: <TbLink size={18} />,
    });
  }

  function toggleHandRaised() {
    const value = !handRaised;
    dispatch(setHandRaised(value));
    rtcClient.sendReaction(value ? 'hand-up' : 'hand-down');
  }

  function handleReaction(reaction: Reaction) {
    rtcClient.sendReaction(reaction);
    onReaction(reaction);
  }

  function toggleChat() {
    dispatch(toggleChatOpen());
  }

  function endCall() {
    navigate('/');
  }

  return (
    <Group position={md ? 'center' : 'apart'} align="end" mt="md">
      {!md && (
        <Group spacing={6} align="center">
          <Text
            fz="lg"
            fw={500}
            sx={{
              letterSpacing: 4,
            }}
          >
            {roomId}
          </Text>
          <ActionIcon onClick={copyShareLink} size="lg">
            <TbShare2 size={18} />
          </ActionIcon>
        </Group>
      )}
      <Group position="center" align="center">
        {!xs && (
          <ActionIcon
            size="xl"
            variant="filled"
            color={handRaised ? 'yellow' : 'gray'}
            onClick={toggleHandRaised}
          >
            <TbHandStop size={24} />
          </ActionIcon>
        )}
        <ReactionSelector onReaction={handleReaction} />
        <ActionIcon
          size="xl"
          variant="filled"
          color={userMedia.audioEnabled ? 'gray' : 'gray'}
          onClick={() => dispatch(toggleAudio())}
        >
          {userMedia.audioEnabled ? (
            <TbMicrophone size={24} />
          ) : (
            <TbMicrophoneOff size={24} />
          )}
        </ActionIcon>
        <ActionIcon
          size="xl"
          variant="filled"
          color={userMedia.videoEnabled ? 'gray' : 'gray'}
          onClick={() => dispatch(toggleVideo())}
        >
          {userMedia.videoEnabled ? (
            <TbVideo size={24} />
          ) : (
            <TbVideoOff size={24} />
          )}
        </ActionIcon>
        {!sm && (
          <ActionIcon size="xl" variant="filled" onClick={toggleChat}>
            <TbMessage size={24} />
          </ActionIcon>
        )}
        {md && (
          <Menu>
            <Menu.Target>
              <ActionIcon size="xl" variant="filled">
                <TbDotsVertical size={24} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Room ID</Menu.Label>
              <Menu.Item icon={<TbShare2 size={14} />} onClick={copyShareLink}>
                <Text
                  fw={500}
                  sx={{
                    letterSpacing: 4,
                  }}
                >
                  {roomId}
                </Text>
              </Menu.Item>
              {sm && (
                <>
                  <Menu.Divider />
                  <Menu.Item
                    icon={<TbMessage size={14} />}
                    onClick={toggleChat}
                  >
                    Messages
                  </Menu.Item>
                </>
              )}
              {xs && (
                <Menu.Item
                  icon={<TbHandStop size={14} />}
                  onClick={toggleHandRaised}
                  color={handRaised ? 'yellow' : undefined}
                >
                  Raise hand
                </Menu.Item>
              )}
              <Menu.Divider />
              <Menu.Item
                icon={<TbPhoneX size={14} />}
                onClick={endCall}
                color="red"
              >
                End Call
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
      {!md && (
        <Button color="red" leftIcon={<TbPhoneX size={16} />} onClick={endCall}>
          End Call
        </Button>
      )}
    </Group>
  );
}

export default ControlBar;
