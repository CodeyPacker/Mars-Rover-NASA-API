const store = Immutable.Map({
  currentRover: "curiosity",
  rovers: ["Curiosity", "Opportunity", "Spirit"],
});

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (store, newState = {}, prop) => {
  const newStore = store.merge(newState);
  render(root, newStore);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
  buttonListeners(state);
};

// create content
const App = (state) => {
  const apod = state.get("image");
  const currentRover = state.get("currentRover");
  const roverData = state.get("data");
  return `
        <header></header>
        <main>
            <section class="hero">
                <h1>Rover Dashboard</h2>
                ${imageOfTheDay(apod)}
            </section>
            <section>
                <h2>Choose a Rover</h2>
                <div class="dashboard">
                    <div class="select-rover">
                      ${createButtons(state)}
                    </div>
                    <div class="rover-stats">
                        <div class="rover-stats-card">
                          ${roverStats(roverData, currentRover)}
                        </div>
                    </div>
                </div>
            </section>
            <section class="image-gallery">
              <h2>Recent Images</h2>
              <div class="gallery-wrapper">
                ${roverImages(currentRover, roverData)}
              </div>
            </section>
        </main>
        <footer></footer>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, store);
  getImageOfTheDay((image) => {
    const apod = Immutable.Map({ image });
    updateStore(store, apod);
  });
  getRoverData((data) => {
    const rovers = Immutable.Map({ data });
    updateStore(store, rovers);
  });
});

// ------------------------------------------------------  COMPONENTS

const roverStats = (data, selectedRover) => {
  if (data === undefined) {
    return;
  }
  const {
    landing_date: landingDate,
    launch_date: launchDate,
    name,
    status,
  } = data[selectedRover].photos[0].rover;
  return `
    <h3>${name}</h3>
    <div class="info-card">
        <ul>
            <li>Launch date: ${launchDate}</li>
            <li>Landing date: ${landingDate}</li>
            <li>Status: ${status}</li>
        </ul>
    </div>
  `;
};

// Example of a pure function that renders infomation requested from the backend
const imageOfTheDay = (apod) => {
  if (apod === undefined) {
    return;
  }
  // If image does not already exist, or it is not from today -- request it again
  // const today = new Date();
  // const photodate = new Date(apod.date);

  // if (!apod || apod.date === today.getDate()) {
  //   getImageOfTheDay((image) => {
  //     const apod = Immutable.Map({ image });
  //     updateStore(store, apod);
  //   });
  // }

  // check if the photo of the day is actually type video!
  // if (apod.media_type === "video") {
  //   return `
  //           <p>See today's featured video <a href="${apod.url}">here</a></p>
  //           <p>${apod.title}</p>
  //           <p>${apod.explanation}</p>
  //       `;
  // } else {

  return `
            <img src="${apod.image.url}" height="100%" width="100%" />
        `;
};

// ------------------------------------------------------  API CALLS

const getPhotoHtml = (photoArray) => {
  return photoArray.map((photo) => {
    const { earth_date: earthDate, img_src: src, camera } = photo;
    const html = `
      <div class="image-card">
        <img src="${src}" alt="Photo taken by ${photo.rover.name}"/>
        <ul class="details">
          <li>Earth date: ${earthDate}</li>
          <li>Camera: ${camera.name}</li>
        </ul>
      </div>
    `;
    return html;
  });
};

const roverImages = (rover, data) => {
  if (data === undefined) {
    return;
  }
  return getPhotoHtml(data[rover].photos).join(" ");
};

const createButtons = (state) => {
  const rovers = state.get("rovers");
  const buttonArr = rovers.map((rover) => {
    return `
        <button class="update-rover" value="${rover}">${rover}</button>
      `;
  });
  return buttonArr;
};

const handleUpdateRover = (state, rover) => {
  newRover = rover;
  const newState = state.set("currentRover", newRover);
  updateStore(state, newState);
};

const buttonListeners = (state) => {
  const buttons = [...document.querySelectorAll(".update-rover")];
  buttons.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      handleUpdateRover(state, e.target.innerHTML.toLowerCase());
    })
  );
};

const getImageOfTheDay = (callback) => {
  fetch("http://localhost:3000/apod")
    .then((res) => res.json())
    .then((json) => callback(json));
};

const getRoverData = (callback) => {
  fetch("http://localhost:3000/rovers")
    .then((res) => res.json())
    .then((json) => callback(json));
};
