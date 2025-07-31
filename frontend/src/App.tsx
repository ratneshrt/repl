import { Terminal } from "./components/Terminal"
import './App.css'
import { useCallback, useEffect, useState } from "react"
import { FileTree } from "./components/FileTree"
import { socket } from "./socket"
import Editor from '@monaco-editor/react'

function App() {

  const [fileTree, setFileTree] = useState({})
  const [selectedFile, setSelectedFile] = useState('')
  const [seletectedFileContent, setSelectedFileContent] = useState('')
  const [code, setCode] = useState('')

  const isSaved = seletectedFileContent === code

  useEffect(() => {
    if(!isSaved && code){
      const timer = setTimeout(() => {
        socket.emit("file:change", {
          path: selectedFile,
          content: code
        }, 5 * 1000)
        return () => {
          clearTimeout(timer)
        }
      })
    }
  }, [code, isSaved, selectedFile])

  useEffect(() => {
    setCode("")
  }, [selectedFile])

  useEffect(() => {
    setCode(seletectedFileContent)
  },[seletectedFileContent])

  const getFileTree = async () => {
    const response = await fetch('http://localhost:9000/files')
    const result = await response.json()
    setFileTree(result.tree)
  }

  const getFileContents = useCallback(async () => {
    if(!selectedFile) return
    const response = await fetch(`http://localhost:9000/files/content?path=${selectedFile}`)
    const res = await response.json()
    setSelectedFileContent(res.content)
  }, [selectedFile])

  useEffect(() => {
    if(selectedFile) getFileContents()
  }, [getFileContents, selectedFile])

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
              onSelect={(path: any) => {
                setSelectedFileContent("")
                setSelectedFile(path)
              }} 
              tree={fileTree}/>
          </div>
          <div className="editor">
            {selectedFile && (
              <p>
                {selectedFile.replaceAll("/", " > ")}{" "}
                {isSaved ? "Saved" : "Unsaved"}
              </p>
            )}
            <Editor height="90vh" value={code} onChange={(e: any) => setCode(e)}/>
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
