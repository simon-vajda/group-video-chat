import { logger } from './app.js';
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
  constructor(socket, name) {
    /** @type {string} */
    this.id = randomUUID();
    /** @type {RTCPeerConnection} */
    this.connection = new wrtc.RTCPeerConnection(RTCConfig);
    /** @type {Socket} */
    this.socket = socket;
    /** @type {boolean} */
    this.makingOffer = false;
    /** @type {string} */
    this.name = name;
    /** @type {number} */
    this.index = 0;

    this.connection.onicecandidate = (e) => this.onIceCandidate(e.candidate);
    this.connection.onnegotiationneeded = () => this.onNegotiationNeeded();
    this.connection.onconnectionstatechange = () =>
      this.onConnectionStateChange();

    this.socket.on('answer', (e) => this.onAnswerReceived(e));
    this.socket.on('icecandidate', (e) => this.onCandidateReceived(e));
    this.socket.on('offer', (e) => this.onOfferReceived(e));
  }

  /** @param {RTCIceCandidate} candidate */
  onIceCandidate(iceCandidate) {
    if (iceCandidate && iceCandidate.candidate !== '') {
      this.socket.emit('icecandidate', iceCandidate);
      logger.trace(`Candidate sent to: ${this.id}`);
    }
  }

  async onNegotiationNeeded() {
    await this.sendOffer();
  }

  onConnectionStateChange() {
    logger.trace(`Peer state: ${this.connection.connectionState} ${this.id}`);
  }

  async sendOffer() {
    if (this.makingOffer) {
      logger.trace(`Already making offer: ${this.id}`);
      return;
    }

    if (this.connection.signalingState !== 'stable') {
      logger.trace(`Signaling state not stable: ${this.id}`);
      return;
    }

    try {
      this.makingOffer = true;
      const offer = await this.connection.createOffer();
      await this.connection.setLocalDescription(offer);
      this.socket.emit('offer', this.connection.localDescription);
      logger.trace(`Offer sent to: ${this.id}`);
    } catch (err) {
      logger.error(err);
    } finally {
      this.makingOffer = false;
    }
  }

  async onAnswerReceived(answer) {
    logger.trace(`Answer from: ${this.id}`);
    await this.connection.setRemoteDescription(answer);
  }

  async onCandidateReceived(candidate) {
    logger.trace(`Candidate from: ${this.id}`);
    try {
      await this.connection.addIceCandidate(candidate);
    } catch (err) {
      logger.warn(err);
      logger.warn(candidate, 'Add ice candidate failed');
    }
  }

  async onOfferReceived(offer) {
    logger.trace(`Offer from: ${this.id}`);
    const offerCollision =
      this.makingOffer || this.connection.signalingState !== 'stable';

    if (offerCollision) {
      logger.warn(`Offer collision: ${this.id}`);
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
    logger.trace(`Answer sent to: ${this.id}`);
  }
}

export default Peer;
