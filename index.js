import { preProccessAndSend, stopAudio } from "tts_pipeline/utils";

const MODEL_LIST = ["vits"];
const GENDER_LIST = ["male", "female"];
const SPEAKERID = {
  male: [1, 2],
  female: [0, 1],
};
export const playAudio = (
  textBoxRef,
  eventEmitter=null,
  socketUrl,
  audioContext,
  model = "vits",
  gender = "male",
  speakerId = 0
) => {
  if (!MODEL_LIST.includes(model)) model = MODEL_LIST[0];
  if (!GENDER_LIST.includes(gender)) gender = GENDER_LIST[0];
  if (!SPEAKERID[gender].includes(speakerId)) {
    if (gender === "male") {
      speakerId = SPEAKERID[gender][1];
    } else speakerId = SPEAKERID[gender][0];
  }
  const inputText = textBoxRef.current.value;
  preProccessAndSend(inputText, model, gender, speakerId, socketUrl, audioContext,eventEmitter);
};
export { stopAudio };

