const tmdbKey = '9870a1126969deb4ef642d4b0c802de4';
const moviesBaseUrl = 'https://api.themoviedb.org/3/movie';
const imagesBaseUrl = 'https://image.tmdb.org/t/p/';


let popularSlider;
let exibitionSlider;

const urlTypes = {
  popular: '/popular',
  exibition: '/now_playing'
}

const setParams = (page) => {
  return {
    params: {
      api_key: tmdbKey,
      language: 'pt-BR',
      page,
      region: 'BR'
    }
  }
};

const populateMovies = async ({ listType }) => {
  const movies = JSON.parse(localStorage.getItem(`${listType}_movies`));
  const htmlList = movies.results.map((movie) => {
    return (
      ` <div class="movie-card">
          <i data-movie="${movie.id}" onclick="handleLike(this)" class="favorite fas fa-heart"></i>
          <img src="${imagesBaseUrl}/w154/${movie.poster_path}" alt="poster-${movie.original_title}">
        </div>`
    )
  });
  document.querySelector(`.${listType}-slider`).innerHTML += htmlList.join('');   
}; 

const fetchMovies = async ({ page, listType }) => {
  const params = setParams(page);
  try {
    const response = await axios.get(`${moviesBaseUrl}${urlTypes[listType]}`, params);
    if (response.data) {

      if (listType === 'popular') {
        localStorage.setItem('popular_movies', JSON.stringify(response.data));
      } else {
        localStorage.setItem('exibition_movies', JSON.stringify(response.data))
      }
    } 
  } catch (error) {
    console.log(error);
  }
};

const updateSlider = (info, slider, listType) => {
  slider.destroy();
  populateMovies({listType});
  slider = tns({
    container: `.${listType}-slider`,
    items: 6,
    autoplay: false,
    loop: false,
    nav: false,
    slideBy: 'page',
    mouseDrag: true,
    controlsContainer: `#customize-controls-${listType}`,
    startIndex: info.index + 6
  });
};


const handleNextClickPopular = async () => {
  const info = popularSlider.getInfo();
  const { total_pages, page } = JSON.parse(window.localStorage.getItem('popular_movies'));

  if ((info.index + info.items === 20 * page) && (page < total_pages)) {
    await fetchMovies({page: page + 1, listType: 'popular'});
    updateSlider(info, popularSlider , 'popular');
  }
};

const handleNextClickExibition = async () => {
  const info = exibitionSlider.getInfo();
  const { total_pages, page } = JSON.parse(window.localStorage.getItem('exibition_movies'));

  if ((info.index + info.items === 20 * page) && (page < total_pages)) {
    await fetchMovies({page: page + 1, listType: 'exibition'});
    updateSlider(info, exibitionSlider, 'exibition');
  }
};

const handleLike = (icon) => {
  icon.classList.toggle('liked')
};

window.onload = async () => {
  await fetchMovies({page: 1, listType: 'popular'});
  await fetchMovies({page: 1, listType: 'exibition'});
  populateMovies({listType: 'popular'});
  populateMovies({listType: 'exibition'});

  popularSlider = tns({
    container: '.popular-slider',
    items: 6,
    autoplay: false,
    loop: false,
    nav: false,
    slideBy: 'page',
    mouseDrag: true,
    controlsContainer: '#customize-controls-popular'
  });
  
  exibitionSlider = tns({
    container: '.exibition-slider',
    items: 6,
    autoplay: false,
    loop: false,
    nav: false,
    slideBy: 'page',
    mouseDrag: true,
    controlsContainer: '#customize-controls-exibition'
  });
}
