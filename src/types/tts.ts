export type voice = "SSML_VOICE_GENDER_UNSPECIFIED" | "MALE" | "FEMALE" | "NEUTRAL"

export interface ITextToSpeechBody {
    text: string,
    languageCode: string,
    ssmlGender: voice,
}