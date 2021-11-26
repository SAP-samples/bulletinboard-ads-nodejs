'use strict'

export default function Client() {

    this.getAll = async () => {
        const response = await fetch('/api/v1/ads')
        if (response.status === 200) {
            const ads = await response.json()
            return { ads: ads.value, message: '' }
        } else {
            return { ads: [], message: await response.text() }
        }
    }

    this.get = async (id) => {
        const response = await fetch(`/api/v1/ads/${id}`)
        if (response.status === 200) {
            return { ad: await response.json(), message: '' }
        } else {
            return { ad: {}, message: await response.text() }
        }
    }

    this.delete = async (id) => {
        const response = await fetch(`/api/v1/ads/${id}`, { method: 'delete' })
        if (response.status === 204) {
            return ''
        } else {
            return response.text()
        }
    }

    this.create = async (ad) => {
        const response = await fetch('/api/v1/ads', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ad)
        })
        if (response.status === 201) {
            return { ad: await response.json(), message: '' }
        } else {
            return { ad: {}, message: await response.text() }
        }
    }

    this.update = async (ad) => {
        const response = await fetch(`/api/v1/ads/${ad.id}`, {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ad)
        })
        if (response.status === 200) {
            return { ad: await response.json(), message: '' }
        } else {
            return { ad: {}, message: await response.text() }
        }
    }
}
