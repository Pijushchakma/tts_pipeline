# tts-pipeline

`tts-pipeline` is a package designed to take text input from user's and other info's like model,gender,speaker etc , chunk the text into specified length (based on punctuation), and send those text chunks to a remote server. The it listens on events to receive audio from server and plays the audio.

## Installation

Install the package using npm:

```bash
npm install tts-pipeline
```

# Usage

## Importing the Package

```
import { playAudio, stopAudio } from "tts_pipeline";
```

# Functions

### playAudio(textBoxRef, eventEmitter, socketUrl, audioContext, model, gender, speakerId)

Starts recording audio from the device, chunks the audio into specified durations, and streams the audio chunks to the provided socket URL. If a reference to a textbox is provided, real-time transcription results are displayed in the textbox.

# Parameters:

- `chunk_duration` (number): The duration of each audio chunk in milliseconds.
- `textBoxRef` (object): A reference to a textbox element where transcription results will be displayed.
- `socketUrl` (string): The URL of the remote server to which audio chunks will be streamed.
- `punctuationUrl`(string): The URL of the remote server for adding punctuation to the transcribed text.

# Example

```javascript I'm tab B
import { Box, Button, TextField } from "@mui/material";
import { useRef, useState } from "react";
import { StartRecording, StopRecording } from "stt-streaming-pipeline";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const textBoxRef = useRef(null);
  const handleRecording = (str) => {
    if (str === "stop") {
      setIsRecording(false);
      StopRecording();
    } else {
      setIsRecording(true);
      StartRecording(
        500,
        textBoxRef,
        "your_socket_url",
        "your_punctuation_url"
      );
    }
  };
  return (
    <div className="App" style={{ marginTop: "50px" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          maxWidth: "50vw",
          mx: "auto",
        }}
      >
        <TextField
          ref={textBoxRef}
          id="outlined-multiline-flexible"
          multiline
          fullWidth
          minRows={5}
        />{" "}
        {isRecording ? (
          <Button
            variant="contained"
            onClick={() => handleRecording("stop")}
            style={{ backgroundColor: "red" }}
          >
            {" "}
            stop{" "}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => {
              handleRecording("start");
            }}
          >
            start
          </Button>
        )}
      </Box>
    </div>
  );
}

export default App;
```
