import { Socket } from 'socket.io-client';

const RTCConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
};

class Peer {
  connection: RTCPeerConnection;
  socket: Socket;
  makingOffer = false;

  constructor(socket: Socket) {
    this.connection = new RTCPeerConnection(RTCConfig);
    this.socket = socket;

    this.connection.onnegotiationneeded = () => this.onNegotiationNeeded();
    this.connection.onicecandidate = (e) => this.onIceCandidate(e);
    this.connection.onconnectionstatechange = () =>
      this.onConnectionStateChange();

    this.socket.on('offer', (e) => this.onOfferReceived(e));
    this.socket.on('answer', (e) => this.onAnswerReceived(e));
    this.socket.on('icecandidate', (e) => this.onIceCandidateReceived(e));
  }

  async sendOffer() {
    try {
      this.makingOffer = true;
      await this.connection.setLocalDescription();
      this.socket.emit('offer', this.connection.localDescription);
      console.log('Sending offer');
    } catch (err) {
      console.error('Send offer error', err);
    } finally {
      this.makingOffer = false;
    }
  }

  async onNegotiationNeeded() {
    await this.sendOffer();
  }

  onIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      this.socket.emit('icecandidate', event.candidate);
      console.log('Sending candidate', event.candidate);
    }
  }

  onConnectionStateChange() {
    console.log('Connection state: ', this.connection.connectionState);
  }

  async onOfferReceived(offer: RTCSessionDescriptionInit) {
    const offerCollision =
      this.makingOffer || this.connection.signalingState !== 'stable';
    if (offerCollision) return;

    await this.connection.setRemoteDescription(offer);
    const answer = await this.connection.createAnswer();
    // answer.sdp = answer.sdp?.replace(
    //   'useinbandfec=1',
    //   'useinbandfec=1; stereo=1; maxaveragebitrate=510000',
    // );
    await this.connection.setLocalDescription(answer);
    this.socket.emit('answer', answer);
    console.log('Sending answer', answer);
  }

  async onAnswerReceived(answer: RTCSessionDescriptionInit) {
    await this.connection.setRemoteDescription(answer);
    console.log('Answer received', answer);
  }

  async onIceCandidateReceived(candidate: RTCIceCandidate) {
    try {
      await this.connection.addIceCandidate(candidate);
      console.log('Candidate received', candidate);
    } catch (err) {
      console.error('Candidate received error', candidate);
    }
  }
}

export default Peer;
