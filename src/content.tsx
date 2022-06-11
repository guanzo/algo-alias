import { debounce } from 'lodash-es'

const cl = console.log
const APP_PREFIX = 'Application '
let aliases: Record<string, string> = {}

function textNodesUnder (el = document.body){
  var n, a=[], walk=document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while(n=walk.nextNode()) a.push(n);
  return a;
}

function findAndReplace () {
    const nodes = textNodesUnder()
    for (const node of nodes) {
        if (!node.textContent) { continue }

        const original = node.textContent.trim()
        let key = original
        if (key.startsWith(APP_PREFIX)) {
            key = key.replace(APP_PREFIX, '')
        }

        const alias = aliases[key]
        if (alias) {
            node.textContent = alias
            if (node.parentElement) {
                node.parentElement.title = `Alias of: ${original}`
            }
        }
    }
}

function watchDomUpdates (cb: () => void, parent = document) {
    const observer = new MutationObserver(debounce(cb, 100))
    observer.observe(
        parent.documentElement,
        { childList: true, subtree: true })
}

async function init () {
    watchDomUpdates(findAndReplace)

    chrome.storage.onChanged.addListener((changes) => {
        for (const [key, { newValue }] of Object.entries(changes)) {
            if (key === 'aliases') {
                aliases = newValue
                findAndReplace()
            }
        }
    })

    const res = await chrome.storage.local.get('aliases')
    aliases = res.aliases
}

init()
