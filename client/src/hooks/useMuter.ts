import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUserMedia } from '../state/userMediaSlice';

function useMuter(stream: MediaStream) {
  const userMedia = useSelector(selectUserMedia);

  useEffect(() => {
    stream.getAudioTracks().forEach((track) => {
      track.enabled = userMedia.audioEnabled;
    });
  }, [stream, userMedia.audioEnabled]);

  useEffect(() => {
    stream.getVideoTracks().forEach((track) => {
      track.enabled = userMedia.videoEnabled;
    });
  }, [stream, userMedia.videoEnabled]);
}

export default useMuter;
