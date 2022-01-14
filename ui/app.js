'use strict'

import { html, useState, useEffect } from 'https://unpkg.com/htm@3.1.0/preact/standalone.module.js'
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
        const hash = window.location.hash
        const indexShow = hash.indexOf('#/show/')
        const adId = (indexShow > -1) ? hash.substring(indexShow + 7) : ''
        const indexNew = hash.indexOf('#/new')
        const isCreate = indexNew > -1
        setState({ adId, isCreate })
    }

    const showDetails = state.adId || state.isCreate
    return showDetails
        ? html`<${AdDetails} adId=${state.adId} isCreate=${state.isCreate} />`
        : html`<${AdsOverview} />`
}

const AdsHeader = function () {
    const navToOverview = () => window.location.hash = '#/'
    return html`
        <ui5-shellbar primary-title='Bulletin Board' secondary-title='Advertisements'>
            <ui5-button icon='home' slot='startButton' onclick=${navToOverview}></ui5-button>
        </ui5-shellbar>
    `
}

const AdsOverview = function () {
    const [state, setState] = useState({ ads: [], message: '' })

    useEffect(async () => {
        setState(await client.getAll())
    }, [])

    const navToCreate = () => window.location.hash = '#/new'
    const clearMessage = () => setState(oldState => ({ ...oldState, message: '' }))

    const ads = state.ads.map(ad => html`<${AdsCard} key=${ad.id} ad=${ad} />`)
    const message = state.message ? html`<ui5-message-strip onclose=${clearMessage} design='Negative' style='margin-top: 1rem;'>${state.message}</ui5-message-strip>` : ''
    return html`
        <ui5-page style='height: 100vh;' floating-footer show-footer>
            <${AdsHeader} slot='header' />
            ${message}
            <div style='display: flex; justify-content: center; margin-top: 1rem;'>
                ${ads}
            </div>
            <ui5-bar slot='footer' design='FloatingFooter'>
                <ui5-button onclick=${navToCreate} icon='add' design='Positive' slot='endContent'></ui5-button>
            </ui5-bar>
        </ui5-page>
    `
}

const AdsCard = function (props) {
    const ratingStyle = () => {
        if (props.ad.averageContactRating < 2) {
            return 'color: #b00;'
        } else if (props.ad.averageContactRating < 4) {
            return 'color: #e9730c;'
        } else {
            return 'color: #107e3e;'
        }
    }

    const priceAndCurrency = () => `${props.ad.price} ${props.ad.currency}`

    const navToDetails = () => window.location.hash = `#/show/${props.ad.id}`

    return html`
        <ui5-card class='small' style='margin: 1%; position: relative; width: 12rem; height: 14rem;'>
            <ui5-card-header slot='header' title-text=${props.ad.title} />
            <div style='display: flex; flex-direction: column; align-items: center; margin: 1rem;'>
                <ui5-title style='margin-bottom: 1rem;' level='H3'>${priceAndCurrency}</ui5-title>
                <ui5-title style=${ratingStyle} level='H5'>${props.ad.contact}</ui5-title>
            </div>
            <ui5-button onclick=${navToDetails} design='Emphasized' style='position: absolute; bottom: 5%; right: 5%;'>Details</ui5-button>
        </ui5-card>
    `
}

const AdDetails = function (props) {
    const [state, setState] = useState({ ad: { title: '', price: '', currency: '', contact: '' }, initialAd: {}, isEdit: false, message: '' })

    useEffect(async () => {
        if (!props.isCreate) {
            const { ad, message } = await client.get(props.adId)
            setState({ ...state, ad, initialAd: JSON.parse(JSON.stringify(ad)), message })
        } else {
            setState({ ...state, isEdit: true })
        }
    }, [])

    const clearMessage = () => setState(oldState => ({ ...oldState, message: '' }))

    const updateAd = (ad) => {
        setState(oldState => ({ ...oldState, ad }))
    }

    const cancel = () => {
        setState(oldState => ({ ...oldState, isEdit: false }))
        if (state.isCreate) {
            window.location.hash = '#/'
        } else {
            setState(oldState => ({ ...oldState, ad: JSON.parse(JSON.stringify(state.initialAd)) }))
        }
    }
    const edit = () => setState(oldState => ({ ...oldState, isEdit: true }))

    const del = async () => {
        const message = await client.delete(props.adId)
        setState(oldState => ({ ...oldState, message }))
        if (message) {
            window.location.hash = '#/'
        }
    }
    const save = async () => {
        const message = props.isCreate ? await client.create(state.ad) : await client.update(state.ad)
        setState(oldState => ({ ...oldState, message }))
        if (!message) {
            window.location.hash = '#/'
        }
    }
    const message = state.message ? html`<ui5-message-strip onclose=${clearMessage} design='Negative' style='margin-top: 1rem;'>${state.message}</ui5-message-strip>` : ''
    const buttons = state.isEdit
        ? html`
            <ui5-button onclick=${save} icon='save' slot='endContent'></ui5-button>
            <ui5-button onclick=${cancel} icon='cancel' design='Negative' slot='endContent'></ui5-button>`
        : html`
            <ui5-button onclick=${edit} icon='edit' slot='endContent'></ui5-button>
            <ui5-button onclick=${del} icon='delete' design='Negative' slot='endContent'></ui5-button>`

    return html`
        <ui5-page style='height: 100vh;' floating-footer show-footer>
            <${AdsHeader} slot='header' />
            ${message}
            <${AdCard} ad=${state.ad} onUpdateAd=${updateAd} isEdit=${state.isEdit} />
            <ui5-bar slot='footer' design='FloatingFooter'>${buttons}</ui5-bar>
        </ui5-page>
    `
}

const AdCard = function (props) {
    const update = (property, value) => {
        const ad = { ...props.ad }
        ad[property] = value
        props.onUpdateAd(ad)
    }
    const setTitle = (event) => update('title', event.target.value)
    const setPrice = (event) => update('price', parseFloat(event.target.value))
    const setCurrency = (event) => update('currency', event.target.value)
    const setContact = (event) => update('contact', event.target.value)

    const rating = !props.isEdit ? html`
        <div style='margin: 1rem;'>
            <ui5-label for='rating' style='width: 100%'>Contact Rating</ui5-label>
            <ui5-title id='rating'>
                <ui5-link href=${props.ad.reviewsUrl} target='_blank'>${props.ad.averageContactRating}</ui5-link>
            </ui5-title>
        </div>
    ` : ''

    return html`
        <ui5-card style='margin-top: 1rem;' class='small'>
            <ui5-card-header slot='header' title-text=${props.ad.title} />
            <div style='display: flex; flex-direction: column;'>
                <div style='margin: 1rem;'>
                    <ui5-label required style='width: 100%'>Title</ui5-label>
                    <ui5-input disabled=${!props.isEdit} value=${props.ad.title} onchange=${setTitle} />
                </div>
                <div style='margin: 1rem;'>
                    <ui5-label required style='width: 100%'>Price</ui5-label>
                    <ui5-input type='Number' disabled=${!props.isEdit} value=${props.ad.price} onchange=${setPrice} />
                </div>
                <div style='margin: 1rem;'>
                    <ui5-label required style='width: 100%'>Currency</ui5-label>
                    <ui5-input disabled=${!props.isEdit} value=${props.ad.currency} onchange=${setCurrency} />
                </div>
                <div style='margin: 1rem;'>
                    <ui5-label required style='width: 100%'>Contact</ui5-label>
                    <ui5-input disabled=${!props.isEdit} value=${props.ad.contact} onchange=${setContact} />
                </div>
                ${rating}
            </div>
        </ui5-card>
    `
}

export default App
