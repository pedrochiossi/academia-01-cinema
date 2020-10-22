const tmdbKey = "9870a1126969deb4ef642d4b0c802de4";
const moviesBaseUrl = "https://api.themoviedb.org/3/movie";
const tvBaseUrl = "https://api.themoviedb.org/3/tv";
const imagesBaseUrl = "https://image.tmdb.org/t/p/";

let popularSlider;
let exibitionSlider;
let favoritesSlider;
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

const goToFavorites = () => {
  if (favoritesSlider) {
    window.scrollTo(0,document.body.scrollHeight);
  }
};

const generateHtmlFromData = (data, isFavorite) => {
  const html = data.map((content) =>  {
    return `
        <div class="movie-card">
          <i style="${isFavorite ? 'display: none' : ''}" data-id="${content.id}" onclick="handleLike(this)" class="favorite fas fa-heart"></i>
          <img src="${imagesBaseUrl}/w154/${content.poster_path}" alt="poster-${content.original_title}">
        </div>`; 
  });
  return html.join('');
};

const populateContent = ({ reset = false, listType }) => {
  const isFavorite = listType === 'favorites'
  const content = JSON.parse(localStorage.getItem( isFavorite ? 'favorites' : `${listType}_${activeContent}`));
  const htmlList = generateHtmlFromData(isFavorite ? content : content.results, isFavorite);
  const slider = document.querySelector(`.${listType}-slider`);
  reset ? slider.innerHTML = htmlList : slider.innerHTML += htmlList
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

const updateFavoritesSlider = () => {
  favoritesSlider && favoritesSlider.destroy();
  populateContent({ reset: true, listType: 'favorites'});
  favoritesSlider = tns({
    container: '.favorites-slider',
    items: 6,
    autoplay: false,
    loop: false,
    nav: false,
    slideBy: 'page',
    mouseDrag: true,
    controlsContainer: '#customize-controls-favorites'
  });
}

const getRandomContent = (data) => {
  const index = Math.floor(Math.random() * data.length);
  return data[index];
}

const updateBanners = () => {
  const { results } = JSON.parse(localStorage.getItem(`popular_${activeContent}`));

  const bannerPrimary = document.querySelector('.banner-primary');
  let randomData = getRandomContent(results);
  bannerPrimary.style.backgroundImage = `url(${imagesBaseUrl}/w780/${randomData.backdrop_path})`
  const title = bannerPrimary.querySelector('h2');
  if (activeContent === 'movies') {
    title.innerText = randomData.title;
  } else {
    title.innerText = randomData.name;
  }
  bannerPrimary.querySelector('p').innerText = randomData.overview;

  const bannerSecondary = document.querySelector('.banner-secondary');
  for (let i = 0; i < 2; i += 1) {
    randomData = getRandomContent(results);
    const child = bannerSecondary.children[i]
    child.style.backgroundImage = `url(${imagesBaseUrl}/w342/${randomData.backdrop_path})`
    const title = child.querySelector('h2');
    if (activeContent === 'movies') {
      title.innerText = randomData.title;
    } else {
      title.innerText = randomData.name;
    }
  }
}

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

const handleLike = async (icon) => {
  icon.classList.toggle("liked");
  const id = icon.getAttribute('data-id');
  const content = await fetchContentById(id);
  const favoritesList = JSON.parse(localStorage.getItem('favorites'));
  const favoritesContainer = document.querySelector('.favorites');
  if (!favoritesList || favoritesList.length === 0) {
    localStorage.setItem('favorites', JSON.stringify([content]));
    updateFavoritesSlider();
    favoritesContainer.classList.remove('hidden');
  } else {
    const contentIndex = favoritesList.findIndex(content => content.id === Number(id));
    if (contentIndex !== -1) {
      favoritesList.splice(contentIndex,1);
      localStorage.setItem('favorites', JSON.stringify(favoritesList));
      updateFavoritesSlider();
      if (favoritesList.length === 0) {
        favoritesContainer.classList.add('hidden');
      }
    } else {
      localStorage.setItem('favorites', JSON.stringify([...favoritesList, content]));
      updateFavoritesSlider();
    }
  }

};

const showContent = (contentType) => {
  activeContent = contentType;
  updateBanners();
  updatePopularSlider({ reset: true, contentType});
  updateExibitionSlider({ reset: true, contentType});
  updateLikes();
}

const fetchContentById = async (id) => {
  try {
    const options = {
      params: {
        api_key: tmdbKey,
        language: 'pt-BR'
      }
    };
    if (activeContent === 'movies') {
      const response = await axios.get(`${moviesBaseUrl}/${id}`, options);
      if (response.status === 200) {
        return response.data;
      };
    } 
    const response = await axios.get(`${tvBaseUrl}/${id}`, options);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
};

const updateLikes = () => {
  const favorites = JSON.parse(localStorage.getItem('favorites'));
  favorites.forEach(favorite => {
    const card = document.querySelector(`[data-id="${favorite.id}"]`);
    card.classList.add('liked');
  });
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

  const favorites = JSON.parse(localStorage.getItem('favorites'));
  if (favorites && favorites.length > 0) {

    updateFavoritesSlider();
    updateLikes();
    document.querySelector('.favorites').classList.remove('hidden');
  }

  updateBanners();

  setInterval(() => {
    updateBanners();
  }, 60 * 1000);

};
