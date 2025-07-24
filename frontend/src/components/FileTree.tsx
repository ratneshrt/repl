const FileTreeNode = ({ fileName, nodes, onSelect, path }: any) => {
    const isDir = !!nodes
    return (
        <>
            <div onClick={(e) => {
                e.stopPropagation()
                if(isDir) return
                onSelect(path)
            }} style={{ marginLeft: "10px" }}>
                <p className={isDir ? "" : "file-node"}>{fileName}</p>
                {nodes && (<ul>
                        {Object.keys(nodes).map((child) => (
                            <li key={child}>
                                <FileTreeNode 
                                    onSelect={onSelect} 
                                    path={path + "/" + child} fileName={child} 
                                    nodes={nodes[child]}
                                />
                            </li>
                        ))}
                    </ul>)}
            </div>
        </>
    )
}

export const FileTree = ({ tree, onSelect }: any) => {
    return (
        <>
            <div>
                <FileTreeNode fileName="/" path="" onSelect={onSelect} nodes={tree}/>
            </div>
        </>
    )
}