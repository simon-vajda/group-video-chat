import { logger } from './app';
import wrtc from 'wrtc';
import { randomUUID } from 'crypto';
import { Socket } from 'socket.io';

const RTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:chat.vsimon.hu:3478',
      username: 'group-video-chat',
      credential: 'group-video-chat',
    },
  ],
};

class Peer {
  id: string;
  connection: RTCPeerConnection;
  candidateBuffer: RTCIceCandidate[] = [];
  socket: Socket;
  makingOffer = false;
  name: string;
  index: number;
  handRaised = false;

  constructor(socket: Socket, name: string) {
    this.id = randomUUID();
    this.connection = new wrtc.RTCPeerConnection(RTCConfig);
    this.socket = socket;
    this.makingOffer = false;
    this.name = name;
    this.index = 0;

    this.connection.onicecandidate = (e) => this.onIceCandidate(e.candidate);
    this.connection.onnegotiationneeded = () => this.onNegotiationNeeded();
    this.connection.onconnectionstatechange = () =>
      this.onConnectionStateChange();

    this.socket.on('answer', (e) => this.onAnswerReceived(e));
    this.socket.on('icecandidate', (e) => this.onCandidateReceived(e));
    this.socket.on('offer', (e) => this.onOfferReceived(e));
  }

  private onIceCandidate(iceCandidate: RTCIceCandidate | null) {
    if (iceCandidate && iceCandidate.candidate !== '') {
      this.socket.emit('icecandidate', iceCandidate);
      logger.trace(`Candidate sent to: ${this}`);
    }
  }

  private async onNegotiationNeeded() {
    await this.sendOffer();
  }

  private onConnectionStateChange() {
    logger.trace(`Peer ${this} state: ${this.connection.connectionState}`);
  }

  private async sendOffer() {
    if (this.makingOffer) {
      logger.trace(`Already making offer: ${this}`);
      return;
    }

    if (this.connection.signalingState !== 'stable') {
      logger.trace(`Signaling state not stable: ${this}`);
      return;
    }

    try {
      this.makingOffer = true;
      const offer = await this.connection.createOffer();
      await this.connection.setLocalDescription(offer);
      this.socket.emit('offer', this.connection.localDescription);
      logger.trace(`Offer sent to: ${this}`);
    } catch (err) {
      logger.error(err);
    } finally {
      this.makingOffer = false;
    }
  }

  private async onAnswerReceived(answer) {
    logger.trace(`Answer from: ${this}`);
    await this.connection.setRemoteDescription(answer);
  }

  private async onCandidateReceived(candidate) {
    logger.trace(`Candidate from: ${this}`);
    try {
      if (this.connection.remoteDescription) {
        await this.connection.addIceCandidate(candidate);
      } else {
        this.candidateBuffer.push(candidate);
      }
    } catch (err) {
      logger.warn(err);
      logger.warn(candidate, 'Add ice candidate failed');
    }
  }

  private async onOfferReceived(offer) {
    logger.trace(`Offer from: ${this}`);
    const offerCollision =
      this.makingOffer || this.connection.signalingState !== 'stable';

    if (offerCollision) {
      logger.warn(`Offer collision: ${this}`);
      return;
    }

    await this.connection.setRemoteDescription(offer);
    const answer = await this.connection.createAnswer();
    // answer.sdp = answer.sdp?.replace(
    //   'useinbandfec=1',
    //   'useinbandfec=1; stereo=1; maxaveragebitrate=510000',
    // );
    await this.connection.setLocalDescription(answer);
    this.socket.emit('answer', answer);
    logger.trace(`Answer sent to: ${this}`);

    while (this.candidateBuffer.length) {
      const candidate = this.candidateBuffer.shift();
      if (candidate) {
        try {
          await this.connection.addIceCandidate(candidate);
        } catch (err) {
          console.error('Add ice candidate error', err, candidate);
        }
      }
    }
  }

  toString() {
    return `${this.name} (${this.id})`;
  }
}

export default Peer;
