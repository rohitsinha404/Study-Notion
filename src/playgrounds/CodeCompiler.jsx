import axios from "axios";
import React, { useEffect, useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-solarized_dark";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/theme-terminal";
import "ace-builds/src-noconflict/theme-xcode";
import { getGeminiResponseForCode } from "../utils/getGeminiResponse";
import toast from "react-hot-toast";
import { IoIosArrowDropdownCircle } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import { RiAiGenerate } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function CodeCompiler() {
  const [code, setCode] = useState(`# Welcome to StudyNotion Playgrounds!
  
# Press ALT + / to generate code from prompt

print("Welcome to StudyNotion Playgrounds!")`);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [theme, setTheme] = useState("twilight");
  const [fontSize, setFontSize] = useState(18);
  const [showThemes, setShowThemes] = useState(false);
  const [language, setLanguage] = useState("python");
  const [showLanguage, setShowLanguage] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [showPrompt, setShowPrompt] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const themes = [
    "monokai",
    "github",
    "solarized_dark",
    "twilight",
    "terminal",
    "xcode",
  ];

  const languages = [
    { name: "C++", value: "c_cpp" },
    { name: "Python", value: "python" },
    { name: "Java", value: "java" },
  ];

  const changeTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    setShowThemes(false);
  };

  const changeLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setShowLanguage(false);
    // Set default code snippet based on selected language
    switch (selectedLanguage) {
      case "c_cpp":
        setCode(`#include <iostream>

using namespace std;

int main() {

     //  Press ALT + / to generate code from prompt

    cout << "Welcome to StudyNotion Playgrounds!" << endl;
    return 0;
}`);
        break;
      case "python":
        setCode(`# Welcome to StudyNotion Playgrounds!

# Press ALT + / to generate code from prompt

print("Welcome to StudyNotion Playgrounds!")`);
        break;
      case "java":
        setCode(`public class Main {
    public static void main(String[] args) {

        //  Press ALT + / to generate code from prompt

        System.out.println("Welcome to StudyNotion Playgrounds!");
    }
}`);
        break;
      default:
        setCode("");
    }
  };

  const increaseFontSize = () => {
    setFontSize(fontSize + 2);
  };

  const decreaseFontSize = () => {
    if (fontSize > 8) {
      setFontSize(fontSize - 2);
    }
  };

  const toggleThemes = () => {
    setShowThemes(!showThemes);
  };

  const toggleLanguage = () => {
    setShowLanguage(!showLanguage);
  };

  const runCode = async () => {
    if (token === null || user === null) {
      navigate("/login");
      toast.error("Login first to run the code.");
      return;
    }

    setCompiling(true);
    setError("");
    setOutput("Compiling...");

    const encodedCode = btoa(code);
    const encodedInput = btoa(input);

    const language_id = {
      c_cpp: 52,
      python: 71,
      java: 62,
    };

    const options = {
      method: "POST",
      url: "https://judge0-ce.p.rapidapi.com/submissions",
      params: {
        base64_encoded: "true",
        fields: "*",
      },
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": process.env.REACT_APP_X_RapidAPI_Key,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      data: {
        language_id: language_id[language],
        source_code: encodedCode,
        stdin: encodedInput,
      },
    };

    try {
      const response = await axios.request(options);
      const token = response.data.token;

      const resultOptions = {
        method: "GET",
        url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        params: {
          base64_encoded: "true",
          fields: "*",
        },
        headers: {
          "X-RapidAPI-Key": process.env.REACT_APP_X_RapidAPI_Key,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      };

      const interval = setInterval(async () => {
        try {
          const resultResponse = await axios.request(resultOptions);
          const status = resultResponse.data.status;
          if (status.id <= 2) {
            console.log("Running...");
          } else if (status.id === 3) {
            clearInterval(interval);
            setOutput(atob(resultResponse.data.stdout));
            setCompiling(false);
          } else {
            clearInterval(interval);
            setOutput(
              resultResponse.data.stderr || resultResponse.data.compile_output
            );
            console.log("hlo ", resultResponse);
            setError("Compilation Error");
            setCompiling(false);
          }
        } catch (error) {
          console.error(error);
          clearInterval(interval);
          setCompiling(false);
          setError("An error occurred while compiling.");
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      setCompiling(false);
      setError("An error occurred while compiling.");
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key === "/") {
        event.preventDefault();
        openPrompt();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const openPrompt = () => {
    setShowPrompt((prevShowPrompt) => !prevShowPrompt);
    console.log(showPrompt);
  };

  const handleGetCode = async () => {
    if (token === null || user === null) {
      navigate("/login");
      toast.error("Login first to run the code.");
      return;
    }
    setGenerating(true);
    try {
      const geminiResponse = await getGeminiResponseForCode(prompt, language);
      const cleanedCode = geminiResponse.replace(/```.*\n?/g, "");

      setCode("");
      simulateTyping(cleanedCode);
      // setLoading(false);
      setGenerating(false);
    } catch (e) {
      setGenerating(false);
      console.log(e);
    }
  };

  const simulateTyping = (geminiResponse) => {
    const interval = setInterval(() => {
      setCode((prevCode) => {
        const nextChar = geminiResponse.charAt(prevCode.length);
        if (!nextChar) {
          clearInterval(interval);
          return geminiResponse;
        }
        return prevCode + nextChar;
      });
    }, 25);
  };

  return (
    <div className="text-white p-4 rounded">
      <h2 className="text-2xl font-bold mb-4">Online Code Compiler</h2>
      <div className="flex justify-between p-5 items-center ">
        <div className="flex flex-col ">
          {/*  Buttons and Ace Editor    */}

          <div className="flex mb-4 justify-between ">
            <div className="relative inline-flex">
              <button
                onClick={toggleLanguage}
                className="bg-[#ffd60a] text-black px-4 py-2 rounded inline-flex items-center"
              >
                <span className="mr-1">
                  {languages.find((lang) => lang.value === language).name}
                </span>
                <IoIosArrowDropdownCircle />
              </button>
              {showLanguage && (
                <ul className="absolute text-gray-700 pt-1 z-10 border border-white rounded-xl bg-[#0f0f0f] transition-all duration-200 ease-in top-full">
                  {languages.map((lang, index) => (
                    <li key={index}>
                      <button
                        onClick={() => changeLanguage(lang.value)}
                        className="rounded bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap border-[#2e2e2e]"
                      >
                        {lang.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              className={`${
                compiling ? "bg-gray-500 cursor-not-allowed" : "bg-[#2ccd41]"
              } text-white px-2 py-3 rounded-md font-semibold hover:bg-[#27e841] `}
              onClick={runCode}
              disabled={compiling}
            >
              {compiling ? "Compiling..." : "Compile And Run"}
            </button>

            <div className="flex bg ">
              <div className="flex">
                <div className="flex items-center justify-center gap-2">
                  <button
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mr-2 flex items-center"
                    onClick={decreaseFontSize}
                  >
                    <h1 className="font-extrabold ">-</h1>
                  </button>
                  <span className="text-xl font-semibold">{fontSize}px</span>
                  <button
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mr-2 flex items-center"
                    onClick={increaseFontSize}
                  >
                    <h1 className="font-extrabold ">+</h1>
                  </button>
                </div>
              </div>
              <div className="inline-block relative bg">
                <button
                  onClick={toggleThemes}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded inline-flex items-center"
                >
                  <span className="mr-1 bg-[#ffd60a] text-black px-2 py-3 rounded-md font-semibold flex  items-center justify-center gap-2   ">
                    Theme <IoIosArrowDropdownCircle />
                  </span>
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 7l4-4v14l-4-4V7z" />
                  </svg>
                </button>
                {showThemes && (
                  <ul className="absolute text-gray-700 pt-1 z-10 border border-white  rounded-xl bg-[#0f0f0f] transition-all duration-200 ease-in">
                    {themes.map((themeName, index) => (
                      <li key={index}>
                        <button
                          onClick={() => changeTheme(themeName)}
                          className="rounded bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap border-[#2e2e2e]"
                        >
                          {themeName}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {showPrompt && (
            <div
              style={{ width: "100%" }}
              className="pt-3 transition-all duration-300 ease-in-out  animate-fade-up
"
            >
              <div className="flex items-center bg-[#515050] rounded-xl mb-4">
                <input
                  className="bg-transparent text-white px-2 py-4 rounded-xl w-full outline-none"
                  type="text"
                  placeholder="Enter prompt to generate code"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <button
                  className="text-white px-4 py-2 rounded-xl"
                  onClick={handleGetCode}
                  disabled={generating}
                >
                  {generating ? (
                    <RiAiGenerate className="animate-wiggle animate-infinite" />
                  ) : (
                    <IoSend />
                  )}
                </button>
              </div>

              <p style={{ color: "#777", fontSize: "14px" }}>
                Type your prompt and click Generate to see the code.
              </p>
            </div>
          )}

          {/* Ace Editor */}
          <AceEditor
            mode={language}
            theme={theme}
            name="code-editor"
            editorProps={{ $blockScrolling: true }}
            value={code}
            onChange={setCode}
            fontSize={fontSize}
            width={window.innerWidth < 768 ? "100%" : "850px"}
            className="w-full h-40 border border-gray-300 rounded-md p-2 mb-4 mt-5"
          />
        </div>

        {/* Std boxes */}
        <div>
          {/* Input Box */}
          <div className="w-[450px] ">
            <label htmlFor="input" className="block mb-2 font-semibold">
              Enter your input (stdin):
            </label>
            <textarea
              id="input"
              name="input"
              placeholder="Enter your input here..."
              className="w-full border border-gray-300 rounded-md p-2 mb-4 text-white font-semibold h-[250px] bg-[#0f0f0f]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          {/* Output Box */}

          <label htmlFor="input" className="block mb-2 font-semibold">
            Output (stdout):
          </label>
          <div
            id="output"
            className="w-full   border border-gray-300 rounded-md p-2 mb-4 text-white font-semibold h-[250px] bg-[#0f0f0f] "
          >
            {/* {compiling && <p>Compiling...</p>} */}
            {error && <p>Error: Compilation Error </p>}
            {!error && output && <p>{output}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeCompiler;
