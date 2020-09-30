window.onload = () => {  
  const popularSlider = tns({
    container: '.popular-slider',
    items: 6,
    autoplay: false,
    loop: false,
    nav: false,
    slideBy: 'page',
    mouseDrag: true,
    controlsContainer: '#customize-controls-popular'
  });

  const exibitionSlider = tns({
    container: '.exibition-slider',
    items: 6,
    autoplay: false,
    loop: false,
    nav: false,
    slideBy: 'page',
    mouseDrag: true,
    controlsContainer: '#customize-controls-exibition'
  });

  const hearts = document.querySelectorAll('.favorite');

  hearts.forEach((heart) => {
    heart.onclick = (e) => {
      e.target.classList.toggle('liked');
    }
  })
}
