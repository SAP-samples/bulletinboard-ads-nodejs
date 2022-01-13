'use strict'

import { createApp } from 'https://cdn.jsdelivr.net/npm/vue@3.2.22/dist/vue.esm-browser.prod.js'

const app = createApp({
    template: html`
        <div>
            <ads-overview v-if='!adId && !isCreate' />
            <ad-details v-if='adId || isCreate' :adId='adId' :isCreate='isCreate' />
        </div>
    `,
    data: function () {
        return { adId: '', isCreate: false }
    },
    created: function () {
        this.setAdIdFromUrl()
        addEventListener('hashchange', () => this.setAdIdFromUrl())
    },
    methods: {
        setAdIdFromUrl: function () {
            const hash = window.location.hash
            const indexShow = hash.indexOf('#/show/')
            this.adId = (indexShow > -1) ? hash.substr(indexShow + 7) : ''
            const indexNew = hash.indexOf('#/new')
            this.isCreate = indexNew > -1
        }
    }
})

app.config.compilerOptions.isCustomElement = tag => tag.startsWith('ui5-')

app.component('ads-header', {
    template: html`
        <ui5-shellbar primary-title='Bulletin Board' secondary-title='Advertisements'>
            <ui5-button icon='home' slot='startButton' @click='toOverview'></ui5-button>
        </ui5-shellbar>
    `,
    methods: {
        toOverview: function () {
            window.location.hash = '#/'
        }
    }
})

app.component('ads-overview', {
    template: html`
        <ui5-page style='height: 100vh;' floating-footer show-footer>
            <ads-header slot='header' />

            <ui5-message-strip v-if='message' @close='clearMessage' design='Negative' style='margin-top: 1rem;'>{{message}}</ui5-message-strip>

            <div style='display: flex; justify-content: center; margin-top: 1rem;'>
                <ads-card v-for='ad in ads' key='ad.id' :ad='ad' />
            </div>

            <ui5-bar slot='footer' design='FloatingFooter'>
                <ui5-button @click='create' icon='add' design='Positive' slot='endContent'></ui5-button>
            </ui5-bar>
        </ui5-page>
    `,
    data: function () {
        return { ads: [], message: '' }
    },
    created: async function () {
        const response = await fetch('/api/v1/ads')
        if (response.status === 200) {
            this.message = ''
            const ads = await response.json()
            this.ads = ads.value
            } else {
            this.message = await response.text()
        }        
    },
    methods: {
        clearMessage: function () {
            this.message = ''
        },
        create: function () {
            window.location.hash = '#/new'
        }
    }
})

app.component('ads-card', {
    template: html`
        <ui5-card class='small' style='margin: 1%; position: relative; width: 12rem; height: 14rem;'>
            <ui5-card-header slot='header' :title-text='ad.title' />
            <div style='display: flex; flex-direction: column; align-items: center; margin: 1rem;'>
                <ui5-title style='margin-bottom: 1rem;' level='H3'>{{priceAndCurrency}}</ui5-title>
                <ui5-title :style='ratingStyle' level='H5'>{{ad.contact}}</ui5-title>
            </div>
            <ui5-button @click='toDetails' design='Emphasized' style='position: absolute; bottom: 5%; right: 5%;'>Details</ui5-button>
        </ui5-card>
    `,
    props: ['ad'],
    computed: {
        priceAndCurrency: function () {
            return `${this.ad.price} ${this.ad.currency}`
        },
        ratingStyle: function () {
            if (this.ad.averageContactRating < 2) {
                return 'color: #b00;'
            } else if (this.ad.averageContactRating < 4) {
                return 'color: #e9730c;'
            } else {
                return 'color: #107e3e;'
            }
        }
    },
    methods: {
        toDetails: function () {
            window.location.hash = `#/show/${this.ad.id}`
        }
    }
})

app.component('ad-details', {
    template: html`
        <ui5-page style='height: 100vh;' floating-footer show-footer>
            <ads-header slot='header' />

            <ui5-message-strip v-if='message' @close='clearMessage' design='Negative' style='margin-top: 1rem;'>{{message}}</ui5-message-strip>

            <ui5-card style='margin-top: 1rem;' class='small'>
                <ui5-card-header slot='header' :title-text='ad.title' />
                <div style='display: flex; flex-direction: column;'>
                    <div style='margin: 1rem;'>
                        <ui5-label required for='title' style='width: 100%'>Title</ui5-label>
                        <ui5-input id='title' :disabled='!isEdit' v-model='ad.title' />
                    </div>
                    <div style='margin: 1rem;'>
                        <ui5-label required for='price' style='width: 100%'>Price</ui5-label>
                        <ui5-input id='price' type='Number' :disabled='!isEdit' :value='ad.price' @change='setPrice' />
                    </div>
                    <div style='margin: 1rem;'>
                        <ui5-label required for='currency' style='width: 100%'>Currency</ui5-label>
                        <ui5-input id='currency' :disabled='!isEdit' v-model='ad.currency' />
                    </div>
                    <div style='margin: 1rem;'>
                        <ui5-label required for='contact' style='width: 100%'>Contact</ui5-label>
                        <ui5-input id='contact' :disabled='!isEdit' v-model='ad.contact' />
                    </div>
                    <div v-if='!isEdit' style='margin: 1rem;'>
                        <ui5-label for='rating' style='width: 100%'>Contact Rating</ui5-label>
                        <ui5-title id='rating'>
                            <ui5-link :href='ad.reviewsUrl' target='_blank'>{{ad.averageContactRating}} ({{trustLevel}})</ui5-link>
                        </ui5-title>
                    </div>
                </div>
            </ui5-card>

            <ui5-bar slot='footer' design='FloatingFooter'>
                <ui5-button v-if='!isEdit' @click='edit' icon='edit' slot='endContent'></ui5-button>
                <ui5-button v-if='!isEdit' @click='del' icon='delete' design='Negative' slot='endContent'></ui5-button>
                <ui5-button v-if='isEdit' @click='save' icon='save' slot='endContent'></ui5-button>
                <ui5-button v-if='isEdit' @click='cancel' icon='cancel' design='Negative' slot='endContent'></ui5-button>
            </ui5-bar>
        </ui5-page>
    `,
    props: ['adId', 'isCreate'],
    data: function () {
        return {
            ad: {},
            initialAd: {},
            isEdit: false,
            message: ''
        }
    },
    created: async function () {
        // Don't ask me why we have to delay this, seems to be a WebComponents bug: it works without delay when using <input> instead of <ui5-input>
        setTimeout(() => this.isEdit = this.isCreate, 0)
        if (!this.isCreate) {
            const response = await fetch(`/api/v1/ads/${this.adId}`)
            this.ad = await response.json()
            this.initialAd = JSON.parse(JSON.stringify(this.ad))
        }
    },
    computed: {
        trustLevel: function () {
            if (this.ad.averageContactRating < 2) {
                return 'Untrusted'
            } else if (this.ad.averageContactRating < 4) {
                return 'Average'
            } else {
                return 'Trusted'
            }
        }
    },
    methods: {
        setPrice: function (event) {
            this.ad.price = parseFloat(event.target.value)
        },
        clearMessage: function () {
            this.message = ''
        },
        cancel: function () {
            this.isEdit = false
            if (this.isCreate) {
                window.location.hash = '#/'
            } else {
                this.ad = JSON.parse(JSON.stringify(this.initialAd))
            }
        },
        edit: function () {
            this.isEdit = true
        },
        del: async function () {
            await fetch(`/api/v1/ads/${this.adId}`, {
                method: 'delete'
            })
            window.location.hash = '#/'
        },
        save: async function () {
            if (this.isCreate) {
                const response = await fetch('/api/v1/ads', {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.ad)
                })
                if (response.status === 201) {
                    const locationSegments = response.headers.get('location').split('/')
                    this.isEdit = false
                    this.message = ''
                    this.ad = await response.json()
                    this.initialAd = JSON.parse(JSON.stringify(this.ad))
                    window.location.hash = `#/show/${locationSegments[locationSegments.length - 1]}`
                } else {
                    this.message = await response.text()
                }
            } else {
                const response = await fetch(`/api/v1/ads/${this.adId}`, {
                    method: 'put',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.ad)
                })
                if (response.status === 200) {
                    this.isEdit = false
                    this.message = ''
                    this.ad = await response.json()
                    this.initialAd = JSON.parse(JSON.stringify(this.ad))
                } else {
                    this.message = await response.text()
                }
            }
        }
    }
})

export default app
