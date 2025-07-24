import { Terminal } from "./components/Terminal"
import './App.css'
import { useEffect, useState } from "react"
import { FileTree } from "./components/FileTree"
import { socket } from "./socket"
import AceEditor from "react-ace";
import ace from "ace-builds/src-noconflict/ace"
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

ace.config.set('basePath', '/ace')

function App() {

  const [fileTree, setFileTree] = useState({})
  const [selectedFile, setSelectedFile] = useState('')

  const getFileTree = async () => {
    const response = await fetch('http://localhost:9000/files')
    const result = await response.json()
    setFileTree(result.tree)
  }

  // useEffect(() => {
  //   getFileTree()
  // }, [])

  useEffect(() => {
    socket.on('file:refresh', getFileTree)
    return () => {
      socket.off('file:refresh', getFileTree)
    }
  }, [])

  return (
    <>
      <div className="playground-container">
        <div className="editor-container">
          <div className="files">
            <FileTree 
              onSelect={(path: any) => setSelectedFile(path)} tree={fileTree}/>
          </div>
          <div className="editor">
            {selectedFile && <p>{selectedFile}</p>}
            <AceEditor
              mode="java"
              theme="github"
              name="code-editor"
              width="600px"
              height="400px"
            />
          </div>
        </div>
        <div className="terminal-container">
          <Terminal />
        </div>
      </div>
    </>
  )
}

export default App
