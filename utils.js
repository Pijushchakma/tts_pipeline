import io from "socket.io-client";

let socket = null;
let totalAudioNumber = 0;
let audioQueue = [];
let currentIndex = 0;
let EventEmitter = null;
let audioContext = null;
let currentSource = null; // To keep track of the current audio source

export const preProccessAndSend = async (
  inputText,
  model,
  gender,
  speakerId,
  socketUrl,
  AudioContext,
  eventEmitter
) => {
  EventEmitter = eventEmitter;
  audioContext = AudioContext;
  audioQueue = []
  totalAudioNumber = 0
  currentIndex = 0

  await initializeWebSocket(socketUrl);

  const messageList = inputText.split(/([,;।?!]+)|\r?\n+/).filter((line) => {
    if (line && line.trim() !== "") {
      return line.trim();
    }
  });

  const punctuationList = [",", ";", "।", "!", "?"];
  let chunkListWithPunctuations = [];
  let j = 0;
  for (let i = 0; i < messageList.length; i++) {
    if (punctuationList.includes(messageList[i])) {
      chunkListWithPunctuations[j - 1] =
        chunkListWithPunctuations[j - 1] + messageList[i];
    } else {
      chunkListWithPunctuations.push(messageList[i]);
      j += 1;
    }
  }


  // Send the first element immediately
  if (chunkListWithPunctuations.length > 0) {
    socket.emit("text_transmit", {
      text: chunkListWithPunctuations[0],
      index: 0,
      model: model,
      gender: gender,
      speaker: speakerId,
    });

    totalAudioNumber = chunkListWithPunctuations.length;
  }

  // Send the remaining elements at 100 ms intervals
  chunkListWithPunctuations.slice(1).forEach((text, index) => {
    setTimeout(() => {
      socket.emit("text_transmit", {
        text: text,
        index: index + 1,
        model: model,
        gender: gender,
        speaker: speakerId,
      });
    }, index * 100);
  });

};

const initializeWebSocket = async (socketUrl) => {
  socket = await io(socketUrl, {
    transports: ["websocket"],
  });
  socket.on("result", (result) => {
    if (parseInt(result["status_code"]) === 200) {
      let audioData = base64ToArrayBuffer(result["audio"]);
      audioQueue[result["index"]] = audioData;
      if (result["index"] === 0) {
        playNextInSequence();
      }
      if (result["index"] === totalAudioNumber - 1) {
        socket.disconnect();
      }
    } else {
      console.log("ERROR !!!");
    }
  });
};

const playNextInSequence = () => {
  if (audioQueue[currentIndex]) {
    playAudio(audioQueue[currentIndex])
      .then(() => {
        if (currentIndex < totalAudioNumber - 1) {
          currentIndex++;
          playNextInSequence();
        } else {
          if (EventEmitter) {
            EventEmitter.emit("playEnded");
          }
        }
      })
      .catch((error) => console.error("Error playing audio:", error));
  }
};

const playAudio = (audioData) => {
  return new Promise((resolve, reject) => {
    audioContext.decodeAudioData(
      audioData,
      (buffer) => {
        currentSource = audioContext.createBufferSource();
        currentSource.buffer = buffer;
        currentSource.connect(audioContext.destination);
        currentSource.onended = resolve;
        currentSource.start(0);
      },
      reject
    );
  });
};

export const stopAudio = () => {
  if (currentSource) {
    currentSource.stop(0); // Stop the current audio source
    currentSource = null;  // Clear the current source
    audioQueue = [];       // Clear the audio queue
    currentIndex = 0;      // Reset the current index
  }
};

const base64ToArrayBuffer = (base64) => {
  let binaryString = atob(base64);
  let len = binaryString.length;
  let bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};
