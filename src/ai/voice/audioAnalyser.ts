/**
 * Web Audio Analyser for real-time microphone and playback amplitude extraction.
 */

export class AudioAnalyser {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private source: MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null =
    null
  private dataArray: Uint8Array<ArrayBuffer> | null = null
  private animationId: number | null = null

  public async connectStream(
    stream: MediaStream,
    onAmplitude: (amp: number) => void,
  ): Promise<void> {
    this.disconnect()

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    this.audioContext = new AudioContextClass()

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 256
    this.analyser.smoothingTimeConstant = 0.8

    this.source = this.audioContext.createMediaStreamSource(stream)
    this.source.connect(this.analyser)

    const bufferLength = this.analyser.frequencyBinCount
    this.dataArray = new Uint8Array(bufferLength)

    const tick = () => {
      if (!this.analyser || !this.dataArray) return
      this.analyser.getByteFrequencyData(this.dataArray)

      let sum = 0
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i]
      }
      const average = sum / this.dataArray.length
      const normalized = Math.min(1, average / 128)
      onAmplitude(normalized)

      this.animationId = requestAnimationFrame(tick)
    }

    tick()
  }

  public connectAudioElement(
    audio: HTMLAudioElement,
    onAmplitude: (amp: number) => void,
  ): void {
    this.disconnect()

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    this.audioContext = new AudioContextClass()

    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 256
    this.analyser.smoothingTimeConstant = 0.8

    try {
      this.source = this.audioContext.createMediaElementSource(audio)
      this.source.connect(this.analyser)
      this.analyser.connect(this.audioContext.destination)
    } catch {
      // Element might already be connected
    }

    const bufferLength = this.analyser.frequencyBinCount
    this.dataArray = new Uint8Array(bufferLength)

    const tick = () => {
      if (!this.analyser || !this.dataArray) return
      this.analyser.getByteFrequencyData(this.dataArray)

      let sum = 0
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i]
      }
      const average = sum / this.dataArray.length
      const normalized = Math.min(1, average / 128)
      onAmplitude(normalized)

      this.animationId = requestAnimationFrame(tick)
    }

    tick()
  }

  public disconnect(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    if (this.source) {
      try {
        this.source.disconnect()
      } catch {
        // Ignore disconnect errors
      }
      this.source = null
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        void this.audioContext.close()
      } catch {
        // Ignore close errors
      }
      this.audioContext = null
    }
    this.analyser = null
    this.dataArray = null
  }
}
