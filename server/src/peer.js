import { logger } from './app.js';
import { v4 as uuidv4 } from 'uuid';
import wrtc from 'wrtc';
import { Socket } from 'socket.io';

const RTCConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

class Peer {
  constructor(socket) {
    /** @type {string} */
    this.id = uuidv4();
    /** @type {RTCPeerConnection} */
    this.connection = new wrtc.RTCPeerConnection(RTCConfig);
    /** @type {Socket} */
    this.socket = socket;
    /** @type {Set<string>} */
    this.connectedTo = new Set();
    /** @type {boolean} */
    this.makingOffer = false;

    this.connection.onicecandidate = (e) => this.onIceCandidate(e);
    this.connection.onnegotiationneeded = () => this.onNegotiationNeeded();
    this.connection.onconnectionstatechange = () =>
      this.onConnectionStateChange();

    this.socket.on('answer', (e) => this.onAnswerReceived(e));
    this.socket.on('icecandidate', (e) => this.onCandidateReceived(e));
    this.socket.on('offer', (e) => this.onOfferReceived(e));
  }

  onIceCandidate({ candidate }) {
    if (candidate) {
      logger.info(`ICE candidate from peer: ${this.id}`);
      this.socket.emit('icecandidate', candidate);
    }
  }

  async onNegotiationNeeded() {
    await this.sendOffer();
  }

  onConnectionStateChange() {
    logger.info(`${this.connection.connectionState} ${this.id}`);
  }

  async sendOffer() {
    if (this.makingOffer) {
      logger.warn('Already making offer');
      return;
    }

    if (this.connection.signalingState !== 'stable') {
      logger.warn(`Signaling state not stable: ${this.id}`);
      return;
    }

    try {
      this.makingOffer = true;
      const offer = await this.connection.createOffer();
      await this.connection.setLocalDescription(offer);
      this.socket.emit('offer', this.connection.localDescription);
      logger.info(`Offer sent to ${this.id}`);
    } catch (err) {
      logger.error(err);
    } finally {
      this.makingOffer = false;
    }
  }

  async onAnswerReceived(answer) {
    logger.info(`Answer from peer: ${this.id}`);
    await this.connection.setRemoteDescription(answer);
  }

  async onCandidateReceived(candidate) {
    logger.info(`Candidate from peer: ${this.id}`);
    await this.connection.addIceCandidate(candidate);
  }

  async onOfferReceived(offer) {
    logger.info(`Offer from peer: ${this.id}`);
    const offerCollision =
      this.makingOffer || this.connection.signalingState !== 'stable';

    if (offerCollision) {
      logger.warn(`Offer collision: ${id}`);
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
    logger.info(`Answer sent to ${this.id}`);
  }
}

export default Peer;
