import { Terminal as XTerminal } from '@xterm/xterm'
import { useEffect, useRef } from 'react'
import { socket } from '../socket'
import '@xterm/xterm/css/xterm.css'

export const Terminal = () => {

    const terminalRef = useRef<any | null>(null)
    const isRendered = useRef(false)

    useEffect(() => {
        if(isRendered.current) return
        isRendered.current = true

        if(!terminalRef.current) return

        const term = new XTerminal({
            rows: 20
        })

        term.open(terminalRef.current)

        term.onData((data) => {
            console.log(data)
            socket.emit('terminal:write', data)
        })

        function onTerminalData(data: string){
            term.write(data)
        }

        socket.on('terminal:data', onTerminalData)

        // return () => {
        //     socket.off("terminal:data", onTerminalData)
        // }
        
    }, [])

    return (
        <div ref={terminalRef} id='terminal' />
    )
}