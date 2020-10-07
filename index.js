const tmdbKey = "9870a1126969deb4ef642d4b0c802de4";
const moviesBaseUrl = "https://api.themoviedb.org/3/movie";
const tvBaseUrl = "https://api.themoviedb.org/3/tv";
const imagesBaseUrl = "https://image.tmdb.org/t/p/";

let popularSlider;
let exibitionSlider;
let activeContent = 'movies';

const urlTypes = {
  popular: "/popular",
  exibition: "/now_playing",
  exibition_tv: "/on_the_air",
};

const setParams = (page) => {
  return {
    params: {
      api_key: tmdbKey,
      language: "pt-BR",
      page,
      region: "BR",
    },
  };
};

const populateContent = async ({ reset = false, listType }) => {
  const content = JSON.parse(
    localStorage.getItem(`${listType}_${activeContent}`)
  );
  const htmlList = content.results.map((result) => {
    return ` <div class="movie-card">
          <i data-id="${result.id}" onclick="handleLike(this)" class="favorite fas fa-heart"></i>
          <img src="${imagesBaseUrl}/w154/${result.poster_path}" alt="poster-${result.original_title}">
        </div>`;
  });
  const slider = document.querySelector(`.${listType}-slider`);
  reset ? slider.innerHTML = htmlList.join('') : slider.innerHTML += htmlList.join('')
};

const fetchMovies = async ({ page, listType }) => {
  const params = setParams(page);
  try {
    const response = await axios.get(
      `${moviesBaseUrl}${urlTypes[listType]}`,
      params
    );
    if (response.data) {
      if (listType === "popular") {
        localStorage.setItem("popular_movies", JSON.stringify(response.data));
      } else {
        localStorage.setItem("exibition_movies", JSON.stringify(response.data));
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const fetchTvShows = async ({ page, listType }) => {
  const params = setParams(page);
  try {
    const response = await axios.get(
      `${tvBaseUrl}${urlTypes[listType]}`,
      params
    );
    if (response.data) {
      if (listType === "popular") {
        localStorage.setItem("popular_tv_shows", JSON.stringify(response.data));
      } else {
        localStorage.setItem(
          "exibition_tv_shows",
          JSON.stringify(response.data)
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const updatePopularSlider = ({reset, info }) => {
  popularSlider.destroy()
  populateContent({reset, listType: 'popular'});
  popularSlider = tns({
    container: '.popular-slider',
    items: 6,
    autoplay: false,
    loop: false,
    nav: false,
    slideBy: "page",
    mouseDrag: true,
    controlsContainer: '#customize-controls-popular',
    startIndex:  info ? info.index + 6 : 0,
  });
};

const updateExibitionSlider = ({reset, info }) => {
  exibitionSlider.destroy()
  populateContent({reset, listType: 'exibition'});
  exibitionSlider = tns({
    container: '.exibition-slider',
    items: 6,
    autoplay: false,
    loop: false,
    nav: false,
    slideBy: "page",
    mouseDrag: true,
    controlsContainer: '#customize-controls-exibition',
    startIndex:  info ? info.index + 6 : 0,
  });
};

const handleNextClickPopular = async () => {
  const info = popularSlider.getInfo();
  const { total_pages, page } = JSON.parse(
    window.localStorage.getItem(`popular_${activeContent}`)
  );

  if (info.index + info.items === 20 * page && page < total_pages) {
    if (activeContent === "movies") {
      await fetchMovies({ page: page + 1, listType: "popular" });
    } else {
      await fetchTvShows({ page: page + 1, listType: "popular" });
    }
    updatePopularSlider({info});
  }
};

const handleNextClickExibition = async () => {
  const info = exibitionSlider.getInfo();
  const { total_pages, page } = JSON.parse(
    window.localStorage.getItem(`exibition_${activeContent}`)
  );

  if (info.index + info.items === 20 * page && page < total_pages) {
    if (activeContent === "movies") {
      await fetchMovies({ page: page + 1, listType: "exibition" });
    } else {
      await fetchTvShows({ page: page + 1, listType: "exibition_tv" });
    }
    updateExibitionSlider({info});
  }
};

const handleLike = (icon) => {
  icon.classList.toggle("liked");
};

const showContent = (contentType) => {
  activeContent = contentType;
  updatePopularSlider({ reset: true, contentType});
  updateExibitionSlider({ reset: true, contentType});
}


window.onload = async () => {
  await fetchMovies({ page: 1, listType: "popular" });
  await fetchMovies({ page: 1, listType: "exibition" });
  await fetchTvShows({ page: 1, listType: "popular" });
  await fetchTvShows({ page: 1, listType: "exibition_tv" });
  populateContent({ listType: "popular", contentType: "movies" });
  populateContent({ listType: "exibition", contentType: "movies" });

  popularSlider = tns({
    container: ".popular-slider",
    items: 6,
    autoplay: false,
    loop: false,
    nav: false,
    slideBy: "page",
    mouseDrag: true,
    controlsContainer: "#customize-controls-popular",
  });

  exibitionSlider = tns({
    container: ".exibition-slider",
    items: 6,
    autoplay: false,
    loop: false,
    nav: false,
    slideBy: "page",
    mouseDrag: true,
    controlsContainer: "#customize-controls-exibition",
  });
};
