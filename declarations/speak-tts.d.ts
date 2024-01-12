declare module 'speak-tts' {
  interface SpeakTTS {
    new (): SpeakTTS;
    init: Function;
    speak: Function;
    speaking: Function;
    cancel: Function;
  }

  const speakTTS: SpeakTTS;
  export default speakTTS;
}
