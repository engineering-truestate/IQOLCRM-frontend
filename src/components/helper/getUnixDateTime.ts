export function getUnixDateTime() {
    return Math.floor(Date.now() / 1000)
}

export function getUnixDateTimeCustom(dateString: string) {
    return Math.floor(new Date(dateString).getTime() / 1000)
}

export function getNextDayUnixDateTime() {
    const secondsInADay = 24 * 60 * 60 // 24 hours in seconds
    return Math.floor(Date.now() / 1000) + secondsInADay
}

export const formatUnixDate = (unix: number) => {
    if (!unix) {
        return
    }

    const timestamp = unix * 1000
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${day}-${month}-${year}`
}

export const formatUnixTime = (unix: number) => {
    if (!unix) {
        return
    }

    const timestamp = unix * 1000
    const date = new Date(timestamp)
    const formattedTime = date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
    console.log(formattedTime)
    return formattedTime
}

export const formatUnixDateTime = (unix: number) => {
    const date = new Date(unix * 1000)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    let hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    const formattedDateTime = `${day}/${month}/${year} | ${hours}:${minutes} ${ampm}`
    return formattedDateTime
}

export const formatUnixDateShort = (unix: number) => {
    if (!unix) {
        return
    }

    const timestamp = unix * 1000
    const date = new Date(timestamp)
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const month = months[date.getMonth()]

    return `${day}-${month}-${year}`
}
