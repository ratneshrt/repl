import express from 'express'
import { Server as SockerServer } from 'socket.io'
import http from 'http'
import * as pty from 'node-pty'
import fs from 'fs/promises'
import path from 'path'
import cors from 'cors'
import chokidar from 'chokidar'

const shell = 'bash'

function stripAnsi(str: string): string{
    return str.replace(
        /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g,
        ''
    )
}

const ptyProcess = pty.spawn(shell, ['--noprofile', '--norc', '-i'], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.INIT_CWD + '/user',
    env: process.env
})

const app = express()
const server = http.createServer(app)
const io = new SockerServer({
    cors: {
        origin: "*"
    }
})

app.use(cors())
app.use(express.json())

io.attach(server)

chokidar.watch(`${process.cwd()}/user`).on('all', (event, path) => {
    io.emit('file:refresh', path)
})

ptyProcess.onData(data => {
    const cleanData = stripAnsi(data)

    io.emit('terminal:data', cleanData)
})

io.on('connection', (socket) => {
    console.log('Socket connected ', socket.id)

    socket.emit('file:refresh')

    socket.on('terminal:write', (data) => {
        console.log('Term', data)
        ptyProcess.write(data)
    })
})

app.get('/files', async (req, res) => {
    const fileTree = await generateFileTree(`${process.cwd()}/user`)
    return res.json({
        tree: fileTree
    })
})

server.listen(9000, () => {
    console.log("docker server running on port 9000")
})

async function generateFileTree(directory: string){
    const tree = {}

    async function buildTree(currentDir: string, currentTree:any){
        const files = await fs.readdir(currentDir)

        for (const file of files){
            const filePath = path.join(currentDir, file)
            const stat = await fs.stat(filePath)

            if(stat.isDirectory()){
                currentTree[file] = {}
                await buildTree(filePath, currentTree[file])
            }else{
                currentTree[file] = null
            }
        }
    }

    await buildTree(directory, tree)
    return tree
}