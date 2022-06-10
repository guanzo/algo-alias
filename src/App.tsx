import { ChangeEvent, useEffect, useState } from 'react'
import './App.css'

const cl = console.log

function App() {
    const [aliasStr, setAliasStr] = useState('')
    const [numRows, setNumRows] = useState(5)

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setAliasStr(e.currentTarget.value)
    }
    const handleSave = () => {
        const savedAlises = saveAliases(aliasStr)
        setAliasStr(dictToCsv(savedAlises))
    }
    const handleClose = () => window.close()

    useEffect(() => {
        chrome.storage.local.get('aliases').then(res => {
            const str = dictToCsv(res.aliases)
            setAliasStr(str)

            const rows = Object.keys(res.aliases).length + 2
            setNumRows(rows)
        })
    }, [])

    return (
        <div className="App">
            <p>
                Enter a value and an alias, separated by a comma.
            </p>
            <textarea rows={numRows} value={aliasStr} onChange={handleChange}>
            </textarea>
            <div className="buttons">
                <button onClick={handleClose}>Close</button>
                <button onClick={handleSave}>Save</button>
            </div>
        </div>
    )
}

function csvToDict (str: string) {
    const dict: Record<string, string> = {}

    const rows = str.split('\n')
    for (const row of rows) {
        const items = row.split(',').map(s => s.trim())
        const [key, alias] = items

        if (key && alias) {
            dict[key] = alias
        }
    }

    return dict
}

function dictToCsv (dict: Record<string, string>) {
    let str = ''
    for (const [key, val] of Object.entries(dict)) {
        str += `${key}, ${val}\n`
    }
    return str
}

function saveAliases (aliasText: string) {
    const aliases = csvToDict(aliasText)
    chrome.storage.local.set({ aliases })

    return aliases
}

export default App
