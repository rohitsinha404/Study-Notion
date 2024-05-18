import axios from "axios";

const API =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
  process.env.REACT_APP_GEMINI_KEY;

export const getGeminiResponseForCode = async (prompt, language = "python") => {
  console.log("api called", prompt, language);
  try {
    const modifiedPrompt =
      "1. If the required prompt is only related to generation of code  , else return the response that you cant do it 2. In the response dont ever give anything extra than a runnable code 3 . add very few comments to the code 4. include the main function , cosnidering u have to write everything in that code  5.If the language is java always name the class as Main , no other thing if and only if language is java else stay same , The prompt is " +
      prompt +
      " in " +
      language +
      " language.";

    const response = await axios({
      url: API,
      method: "POST",
      data: {
        contents: [{ parts: [{ text: modifiedPrompt }] }],
      },
    });

    console.log(response.data.candidates[0].content.parts[0].text);

    return response.data.candidates[0].content.parts[0].text;
  } catch (e) {
    console.log(e);
    return "Unable to generate code for the given prompt. Please try again with a different prompt.";
  }
};
