import React, { useEffect, useState  } from 'react'; 
import * as monaco from 'monaco-editor';
import './Editor.css';
import { HiOutlineCodeBracket } from 'react-icons/hi2';
import MonacoEditor from 'react-monaco-editor';
import { IoSettingsOutline } from "react-icons/io5"; 
// Import your theme definitions here or define them in the same file
import MonoKai from './Themes/monokai.json';
import Cobalt from './Themes/Cobalt.json'; 
import socket from "../../socket"
import CodeSnippet from './CodeSnippet/codeSnippet.json'
import {fontSizes, programmingLanguages,tabSizes} from './Settings/editorSetting'
import { RiFontSize2 } from "react-icons/ri";
import { MdOutlineDarkMode } from "react-icons/md";
import { MdContentCopy } from "react-icons/md";
import { TbSpace } from "react-icons/tb";
import { IoPlay } from "react-icons/io5"; 

import {useCodeCollabContext} from '../../App'
  const CodeEditor = () => {
  const [fontSize, setFontSize] = useState(18);
  const [tabSize, setTabSize] = useState(2);    
  const [language,setLanguage] = useState(63)
  const [settingOpen, setSettingOpen] = useState(false)
  const [code, setCode] = useState();
  const {selectedTheme,setSelectedTheme} = useCodeCollabContext();
  const themes = {
    'cobalt':'Cobalt', 
    'vs-dark': 'Dark Theme',
    'monokai': 'MonoKai Theme',
    'vs-light': 'Light Theme',
  }; 
  
  const editorOptions = {
    selectOnLineNumbers: true,
    fontSize: fontSize,
    tabSize: tabSize,
    fontFamily: 'Fira Code, Menlo, Monaco, "Courier New", monospace',
    lineHeight: 25,
    fontLigatures: true
  };
  useEffect(() => {
    // Dispose of the previous editor instance before creating a new one 
    monaco.editor.defineTheme('monokai', MonoKai); 
    monaco.editor.defineTheme('cobalt', Cobalt);   
    
    window.MonacoEnvironment = {
      getWorkerUrl: function (moduleId, label) {
        return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
          self.MonacoEnvironment = {
            baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/'
          };
          importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs/base/worker/workerMain.js');
        `)}`;
      },
    }; 
    setLanguage('63');//Javascript
    setCode(CodeSnippet['63'])
    setSelectedTheme('cobalt')

    return () => {
     <></> 
    };
  }, []);

  useEffect(()=>{
    socket.on('codeChange', (newCode) => {
      setCode(newCode);
    });
  },[socket])
  const handleEditorDidMount = (editor) => {
    // You can do additional customization or handling after the editor is mounted 
  };

  const handleThemeChange = (event) => {
    const newTheme = event.target.value;
    setSelectedTheme(newTheme);
  };
  const handleFontChange = (event) => {
    const newFontSize = event.target.value;
    setFontSize(newFontSize);
  };
  const handleTabSize = (event) => {
    const newTabSize = event.target.value;
    console.log(newTabSize);
    
    setTabSize(newTabSize);
  };

  const runCode = () => {
    setProcessing(true);
    console.log(language)
    const formData = {
      language_id: language,
      // encode source code in base64
      source_code: btoa(code),
      stdin: btoa(customInput),
    };
    const options = {
      method: "POST",
      url: 'https://judge0-ce.p.rapidapi.com/submissions',
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host":  'judge0-ce.p.rapidapi.com',
        "X-RapidAPI-Key": 'bf1473c2d5msh0be376369a1077dp152884jsn69deee7869f5',
      },
      data: formData,
    };
 
    console.log(options)
    axios
      .request(options)
      .then(function (response) {
        console.log("res.data", response.data);
        const token = response.data.token;
        checkStatus(token);
        // console.log(token)
        // console.log(tokenCheck)
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        setProcessing(false);
        console.log(error);
      });
  };
 
  const checkStatus = async (token) => {
    const options = {
      method: "GET",
      url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host":  'judge0-ce.p.rapidapi.com',
        "X-RapidAPI-Key":  'bf1473c2d5msh0be376369a1077dp152884jsn69deee7869f5',
      },
    };
 
    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;
 
      // Processed - we have a result
      if (statusId === 1 || statusId === 2) {
        // still processing
        setTimeout(() => {
          checkStatus(token)
        }, 2000)
        return
      } else {
        setProcessing(false)
        // setOutputDetails(response.data)
        // showSuccessToast(`Compiled Successfully!`)
        console.log(response)
        console.log('response.data', atob(response.data.stdout))
 
        return
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
      // showErrorToast();
    }
  };

  const handleCodeChange = (newValue, event) => {
  setCode(newValue);
  let roomID = localStorage.getItem("roomID");
  socket.emit('codeChange', { newValue, roomID }); // Pass an object with keys newValue and roomID
};

 
  // const handleCodeChange = (newValue, event) => { 
  //   setCode(newValue);
  //   let roomID = JSON.parse(localStorage.getItem("roomID"))
  //   if(roomID==null){
  //     alert("Invalid room")
  //   }
  //    socket.emit('codeChange',{newValue,roomID});
  //   //socket.emit('codeChange',newValue);
  // }
  const handleSettingOpen = ()=>{
    setSettingOpen((cSetting)=>{
      return !cSetting;
    })
  }

  const handleCopyToClipboard = async () => {
    try{
      await navigator.clipboard.writeText(code) 
      alert('Code Copied!')
    }
    catch(e)
    {
      console.log("Error in copy")
    }
      
  };
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
     
    const model = monaco.editor.getModels()[0]; // Assuming you have only one model
     
    setCode(CodeSnippet[newLanguage])
    monaco.editor.setModelLanguage(model, newLanguage);
  };

  const EditorThemeColor ={
    'vs-dark': '#2f2f2f',
    'vs-light': '#002eb8',
    'monokai': '#2f2f2f',
    'cobalt':'#01111f', 
  }

  const settingRight ={
    'vs-dark': '#4d4d4d',
    'vs-light': '#0038e0',
    'monokai': '#494b40',
    'cobalt':'#01305b',
    
  }
  const settingLeft = {
    'vs-dark': '#2e2d2d',
    'vs-light': '#002eb8',
    'monokai': '#272822',
    'cobalt':'#01203b'
  }
  const buttonTheme ={
    'vs-dark': '#454343',
    'vs-light': '#0037db',
    'monokai': '#272822',
    'cobalt':'#01203b'
  } 
  const editorLanguage = {
        '63':'javascript' ,
        '71': 'python',
        '62': 'java',
        '51': 'csharp',
        '76': 'cpp',
    };
  return ( 
    <div className='editor-continer'>
      <div className="editor-top1" style={{backgroundColor:`${EditorThemeColor[selectedTheme]}`}}> 
       <HiOutlineCodeBracket className="code-icon" />
        <label> Code</label>
        <select className= "form-select" style={{backgroundColor:`${EditorThemeColor[selectedTheme]}`}} value={language} onChange={handleLanguageChange}>
          { programmingLanguages.map(( {id,label}) => (
            <option key={id} value={id}>{label}</option>
            ))}
        </select>
        <div style={{ marginLeft: 'auto' , display:'flex',gap:'1rem'}}> 
             <MdContentCopy className='copy-button' onClick={handleCopyToClipboard} id={selectedTheme==='vs-light'?'white':null}/>
            <IoSettingsOutline className={settingOpen?'setting-icon rotate':'setting-icon'} id={selectedTheme==='vs-light'?'white':null} onClick={handleSettingOpen} /> 
        </div>
             </div>
     {/* <div id="container" style={{ height: '600px' }}></div> */}
     <code>
      <MonacoEditor 
      width={`100%`}
      height="90%"
      language={editorLanguage[language]}
      theme={selectedTheme}
      value = {code}
      options={editorOptions}
      onChange={handleCodeChange}
      editorDidMount={handleEditorDidMount} 
      /> 

     </code>
      {
        settingOpen 
          && 
        <section className='setting-popup' id={selectedTheme==='vs-light'?'popup-light':null}>  
          <section className="section-settingPopup">
            <div className="container-editorSetting">
              <div className='settings-left' style={{backgroundColor:`${settingLeft[selectedTheme]}`}} >
                <span style={{ marginLeft: '-11rem' }} className='settings-left-heading'>Settings</span> 
                  <ul className='left-content'>
                    <li className='left-content-item'>
                    <HiOutlineCodeBracket className='list-icon' />
                    <span>Code Editor</span>
                    </li>
                  </ul>  
              </div>
              <div className='settings-right' style={{backgroundColor:`${settingRight[selectedTheme]}`}} >
                <div className='setting-right-content'>

                  <div className='setting-input' >
                    <label className='setting-input-label'><MdOutlineDarkMode className='settings-icon'/> <span>Theme</span></label>
                    <select className='form-select select-dark' value={selectedTheme}   style={{backgroundColor:`${settingLeft[selectedTheme]}`}} onChange={handleThemeChange}>
                        {Object.entries(themes).map(([themeKey, themeLabel]) => (
                          <option key={themeKey} value={themeKey}>{themeLabel}</option>
                          ))}
                      </select>
                  </div>
               

                  <div className='setting-input'>
                    <label className='setting-input-label'><RiFontSize2 className='settings-icon'/> <span>Font Size</span></label>
                    <select className='form-select select-dark' value={fontSize}    style={{backgroundColor:`${settingLeft[selectedTheme]}`}}  onChange={handleFontChange}>
                    {fontSizes.map((size) => (
                    <option key={size } value={size}>{size+' px'}</option>))}
                    </select>
                  </div>
                  <div className='setting-input'>
                    <label className='setting-input-label'><TbSpace className='settings-icon'/> <span>Tab Size</span></label>
                    <select className='form-select select-dark' value={tabSize}     style={{backgroundColor:`${settingLeft[selectedTheme]}`}} onChange={handleTabSize}>
                    {tabSizes.map((size) => (
                    <option key={size } value={size}>{size}</option>))}
                    </select>
                  </div> 
                </div>
              </div>
            </div>
          </section>
      </section>
      }
      <div onClick={runCode} className= "editor-bottom" style={{backgroundColor:`${EditorThemeColor[selectedTheme]}`}} > 
       <div className='btn-run'style={{backgroundColor:`${buttonTheme[selectedTheme]}`}} > 
        <IoPlay className='btn-run-icon'/>
        <a>Run</a>
       </div>
      </div>
    </div> 
  );
};

export default CodeEditor;
