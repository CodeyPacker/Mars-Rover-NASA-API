let store = {
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    currentRover: 'curiosity',
    roverData: ''
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    let { apod, roverData } = state

    return `
        <header></header>
        <main>
            <section class="hero">
                <h1>Rover Dashboard</h2>
                ${ImageOfTheDay(apod)}
            </section>
            <section>
                <h2>Choose a Rover</h2>
                <div class="dashboard">
                    <div class="select-rover">
                        <button value="curiosity">Curiosity</button>
                        <button value="opportunity">Opportunity</button>
                        <button value="spirit">Spirit</button>
                    </div>
                    <div class="rover-stats">
                        <div class="rover-stats-card">
                            ${roverStats(roverData)}
                        </div>
                    </div>
                </div>
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

const roverStats = (data) => {
    if (!data) { getRover(store) }
    const {id, landing_date: landingDate, launch_date: launchDate, name, status} = data[store.currentRover].photos[0].rover
    return `
        <h3>${name}</h3>
        <div class="info-card">
            <ul>
                <li>Launch date: ${launchDate}</li>
                <li>Landing date: ${landingDate}</li>
                <li>Status: ${status}</li>
            </ul>
        </div>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)

    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="100%" width="100%" />
        `)
    }
}

// ------------------------------------------------------  API CALLS

const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    return apod
}

const getRover = (state) => {
    let { roverData } = state

    fetch(`http://localhost:3000/rovers`)
        .then(res => res.json())
        .then(roverData => {
            updateStore(store, { roverData })
        })

    return roverData
}

let button = document.querySelector('.test')
button.addEventListener('click', () => {

})