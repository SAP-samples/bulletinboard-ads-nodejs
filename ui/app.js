'use strict'

import { html, useState, useEffect } from 'https://unpkg.com/htm@3.1.0/preact/standalone.module.js'
import AdsOverview from './ads-overview.js'
import AdDetails from './ad-details.js'

import Client from '/client.js'

const client = new Client()

const App = function () {
    const [state, setState] = useState({ adId: '', isCreate: false })

    useEffect(() => {
        setStateFromUrl()
        addEventListener('hashchange', setStateFromUrl)
        return () => removeEventListener('hashchange', setStateFromUrl)
    }, [])

    const setStateFromUrl = () => {
        const indexShow = location.hash.indexOf('#/show/')
        const adId = (indexShow > -1) ? location.hash.substring(indexShow + 7) : ''
        const isCreate = location.hash.indexOf('#/new') > -1
        setState({ adId, isCreate })
    }

    const showDetails = state.adId || state.isCreate
    return showDetails
        ? html`<${AdDetails} client=${client} adId=${state.adId} isCreate=${state.isCreate} />`
        : html`<${AdsOverview} client=${client} />`
}

export default App
