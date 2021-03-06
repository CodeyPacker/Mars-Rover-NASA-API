let store = Immutable.Map({
  currentRover: "curiosity",
  rovers: ["Curiosity", "Opportunity", "Spirit"],
});

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (state, newState) => {
  store = state.merge(newState);
  render(root, store);
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
    <main>
      <section class="hero ${!apod && "hide"}">
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
  setTimeout(() => {
    render(root, store);
    getImageOfTheDay((image) => {
      const apod = Immutable.Map({ image });
      updateStore(store, apod);
    });
    getRoverData((data) => {
      const rovers = Immutable.Map({ data });
      updateStore(store, rovers);
    });
  }, 3000);
});

// ------------------------------------------------------  COMPONENTS
// Pure function
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

// Pure function
const imageOfTheDay = (apod) => {
  if (apod === undefined) {
    return `
      <h3>loading...</h3>
    `;
  }

  return `
    <img src="${apod.image.url}" height="100%" width="100%" />
  `;
};

// ------------------------------------------------------  API CALLS

// Higher Order Function that returns a UI element
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

// Pure function
const roverImages = (rover, data) => {
  if (data === undefined) {
    return;
  }
  return getPhotoHtml(data[rover].photos).join(" ");
};

// Higher Order Function that returns a UI element
const createButtons = (state) => {
  const rovers = state.get("rovers");
  return (buttonArr = rovers.map((rover) => {
    return `
      <button class="update-rover" value="${rover}">${rover}</button>
    `;
  }));
};

// Pure function
const handleUpdateRover = (state, rover) => {
  const newState = state.set("currentRover", rover);
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

// Higher Order Function
const getImageOfTheDay = (callback) => {
  fetch("http://localhost:3000/apod")
    .then((res) => res.json())
    .then((json) => callback(json));
};

// Higher Order Function
const getRoverData = (callback) => {
  fetch("http://localhost:3000/rovers")
    .then((res) => res.json())
    .then((json) => callback(json));
};
