document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const apiPopularMovies = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=1',
          apiGenres = 'https://api.themoviedb.org/3/genre/movie/list?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=1',
          apiSearch = 'https://api.themoviedb.org/3/search/movie/?api_key=04c35731a5ee918f014970082a0088b1&query=',
          apiTopMovies = 'https://api.themoviedb.org/3/movie/top_rated?api_key=04c35731a5ee918f014970082a0088b1&page=1',
          apiTopTV = 'https://api.themoviedb.org/3/tv/popular?api_key=04c35731a5ee918f014970082a0088b1&page=1',
          apiAnim = 'https://api.themoviedb.org/3/discover/movie?api_key=04c35731a5ee918f014970082a0088b1&with_genres=16&sort_by=vote_count.desc&vote_count.gte=10&page=1',
          apiActors = 'https://api.themoviedb.org/3/person/popular?api_key=04c35731a5ee918f014970082a0088b1&page=1',
          imgPath = "https://image.tmdb.org/t/p/w1280",
          nextArrow = document.getElementById('next'),
          form = document.querySelector('form'),
          linkMovies = document.getElementById('movies'),
          linkTvShows = document.getElementById('tvshows'),
          linkAnim = document.getElementById('anim'),
          linkActors = document.getElementById('actors'),
          allLinks = document.querySelectorAll('.header__link'),
          mainTitle = document.getElementById('title'),
          genresParent = document.querySelector('.main__list'),
          inputSearch = document.querySelector('.header__option-input'),
          parentMovies = document.querySelector('.main__movies-wrapper');

    const page = {
        api: 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=',
        num: 1,
        name: 'Popular movies'
    };
    const colors = ['rgb(243, 121, 76)', 'rgb(87, 218, 241)', 'rgb(204, 130, 238)', 'rgb(98, 206, 179)'];
    

    function getColor() {
        return Math.floor(Math.random() * colors.length);
    }

    function deleteMovies() {
        const movies = document.querySelectorAll('.main__movie');
        if (movies.length > 0) {
            movies.forEach(movie => movie.remove());
        }
    }

    function deleteActors() {
        const actors = document.querySelectorAll('.main__actor');

        if (actors.length > 0) {
            actors.forEach(movie => movie.remove());
        }    
    }

    function colorGenres() {
        const allGenres = document.querySelectorAll('.main__genre');

        allGenres.forEach(genre => {
            genre.style.cssText = `background-color: ${colors[getColor()]}`;

        });
    }
    // удаление активных классов
    function deleteLinksActiveClass() {
        const activeLink = document.querySelector('.header__link-active');
        const activeGenre = document.querySelector('.main__genre-active');

        if(activeGenre) {
            activeGenre.classList.remove('main__genre-active');
        }

        if(activeLink) {
            activeLink.classList.remove('header__link-active');
        }
    }

    async function getData(url) {
        const response = await fetch(url);

        if(!response.ok) {
            throw new Error(`Error with ${url}, status: ${response.status}`);

        }
        const data = await response.json();
        
        return await data;
    }

    function showMovies(api) {
        getData(api).then(result => result.results)
        .then(result => result.forEach(({backdrop_path, original_title, genre_ids, vote_average, overview, poster_path, release_date, first_air_date, name}) => {
            new PopularMovie(backdrop_path, original_title || name, genre_ids, vote_average, overview, poster_path, release_date || first_air_date, '.main__movies-wrapper').createGenres(genre_ids);
        })).catch(error => console.log(error));
    }

    function showActors(api) {
        getData(api).then(result => result.results)
        .then(result => result.forEach(({name, profile_path}) => {
            new PopularActors(name, profile_path, '.main__actors').render();
        })).catch(error => console.log(error));
    }


    // получение жанра
    function getGenre(data, num) {
        const obj = {};

        data.forEach(item => {
            obj[item.id] = item.name;
        });

        return obj[num];

    }


    // поиск жанров по цифре
    async function getGenres(num) {
        const data = getData(apiGenres).then(result => result.genres)
        .then(result => getGenre(result, num))
        .then(result => {
            return result;
        });

        const result = await data;
        return result;
    }

    // поиск жанра по названию
    async function getNumOfGenre(genre) {
        const data = getData(apiGenres).then(result => result.genres)
        .then(result => {
            for(let key of result) {
                if(key.name == genre) {
                    return key.id;
                }
            }
        });

        const result = await data;
        return result;
        
    }

    function showChosenCategory(category, api) {
        deleteLinksActiveClass();

        const name = category.innerHTML;
                    
        mainTitle.innerHTML = name;
        page.name = name;
        page.num = 1;
        page.api = api.slice(0, api.length-1);
        // console.log(api);

        category.classList.add('header__link-active');

        deleteActors();
        deleteMovies();

        showMovies(api);
    }

    class PopularMovie {
        constructor(img, name, genres, rating, overview, poster, data, parent) {
            this.img = img;
            this.name = name;
            this.rating = rating;
            this.overview = overview;
            this.poster = poster;
            this.data = data;
            this.parent = document.querySelector(parent);
        }

        async createGenres(genres) {
            let str = '';


            if (genres.length > 3) {
                for (let i = 0; i < 3; i++) {
                    if (i == 2) {
                        str += await getGenres(genres[i]);
                    } else {
                        str += await getGenres(genres[i]) + ' / ';
                    }
                }
            } else {
                for (let i = 0; i < genres.length; i++) {
                    if (i == genres.length - 1) {
                        str += await getGenres(genres[i]);

                    } else {
                        str += await getGenres(genres[i]) + ' / ';

                    }
                }
            }

            this.render(str);                        

        }

        render(genre) {
            const div = document.createElement('div');
            div.classList.add('main__movie');

            div.innerHTML = `
                <div class="main__movie-preview">
                <img src="${imgPath + this.poster}" alt="" class="main__movie-img">
                <div class="main__movie-menu">
                    <button class="main__movie-btn">
                        <a href="#" class="main__movie-play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"/></svg>
                        </a>
                    </button>

                    <div class="main__movie-name">
                        <div class="main__movie-title">${this.name}</div>
                        <div class="main__movie-genre">${genre}</div>
                    </div>
                    <hr>
                    <div class="main__movie-rating">
                        <a href="#" class="main__movie-star">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"/></svg>
                        </a>
                        <div class="main__movie-rate">${this.rating}</div>
                    </div>
                </div>
                
            </div>
            <div class="main__overview">
                <div class="main__overview-wrapper">
                    <div class="main__overview-close">&times;</div>
                    <div class="main__overview-img">
                        <img src="${imgPath + this.img}">
                    </div>
                    <div class="main__overview-title">${this.name}</div>
                    <div class="main__overview-rating">
                        <a href="#" class="main__overview-star">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"/></svg>
                    </a>
                        <div class="main__overview-rate">${this.rating}</div>
                        <div class="main__overview-date">${this.data.slice(0,4)}</div>
                    </div>
                    <div class="main__overview-descr">${this.overview}</div>
                    <div class="main__overview-btns">
                        <button class="main__overview-play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"/></svg>
                            Play
                        </button>
                        <button class="main__overview-add">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"/></svg>
                            My list
                        </button>

                    </div>
                </div>
            </div>
            `;

            this.parent.append(div);
        }
    }

    class PopularActors extends PopularMovie {
        constructor(name, img,  parent) {
            super();
            this.img = img;
            this.name = name;
            this.parent = document.querySelector(parent);
        }
        render() {
            const div = document.createElement('div');
            div.classList.add('main__actor');

            div.innerHTML = `
            <div class="main__actor-preview">
                <img src="${imgPath + this.img}" alt="" class="main__movie-img">
                <div class="main__actor-title">${this.name}</div>
            </div>            
            `;

            this.parent.append(div);
        }
    }


    parentMovies.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target;

        const parent = target.parentNode;

        if (target && parent.classList.contains('main__movie')) {

            const movies = document.querySelectorAll('.main__movie');
            movies.forEach(movie => {
                if(parent == movie) {
                    const overview = movie.querySelector('.main__overview');
                    overview.classList.add('show');
                    document.body.style.overflow = 'hidden';

                }
            });
        }

        if (target && target.classList.contains('main__movie-btn')) {

            const btns = document.querySelectorAll('.main__movie-btn');
            btns.forEach((btn,i) => {
                if(target == btn) {
                    const overview = document.querySelectorAll('.main__overview');
                    overview[i].classList.add('show');
                    document.body.style.overflow = 'hidden';

                }
            });
        }

        if (target && target.classList.contains('main__overview-close')) {

            const closes = document.querySelectorAll('.main__overview-close');
            closes.forEach((close, i) => {
                if(target == close) {
                    const overview = document.querySelectorAll('.main__overview');
                    overview[i].classList.remove('show');
                    document.body.style.overflow = '';
                }
            });
        }        

        if (target && target.classList.contains('main__overview')) {
            const showedOverview = document.querySelector('.show');
            showedOverview.classList.remove('show');
            document.body.style.overflow = '';
        }


    });

    document.addEventListener('keydown', (e) => {
        const showedOverview = document.querySelector('.show');

        if (e.code === 'Escape') {
            showedOverview.classList.remove('show');
            document.body.style.overflow = '';

        }
    });

    form.addEventListener('submit', async (e)  => {
        e.preventDefault();
        const value = inputSearch.value;

        deleteMovies();

        showMovies(apiSearch+value);
        

        form.reset();
    });

    // обработчик на кнопки жанров
    genresParent.addEventListener('click', (e) => {
        const target = e.target;

        if (target && target.classList.contains('main__genre')) {
            const genres = document.querySelectorAll('.main__genre');
            
            deleteLinksActiveClass();

            genres.forEach(async (genre) => {
                if (target == genre) {
                    
                    genre.classList.add('main__genre-active');

                    const name = genre.innerHTML;

                    mainTitle.innerHTML = name;
                    page.name = name;
                    page.num = 1;
                    console.log(page);

                    const num = await getNumOfGenre(name);

                    const url = `https://api.themoviedb.org/3/discover/movie?api_key=04c35731a5ee918f014970082a0088b1&with_genres=${num}&sort_by=vote_count.desc&vote_count.gte=10&page=1`;

                    page.api = url;
                    
                    deleteMovies();

                    showMovies(url);
                }
            });
        }
    });


    
    // Обработчик на кнопки в меню
    linkMovies.addEventListener('click', () => {
        showChosenCategory(linkMovies, apiTopMovies);
    });

    linkTvShows.addEventListener('click', () => {
        showChosenCategory(linkTvShows, apiTopTV);
    });

    linkAnim.addEventListener('click', () => {
        showChosenCategory(linkAnim, apiAnim);
    });

    linkActors.addEventListener('click', () => {
        deleteMovies();
        deleteActors();
        deleteLinksActiveClass();

        const name = linkActors.innerHTML;
                    
        mainTitle.innerHTML = name;
        page.api = apiActors.substring(0, apiActors.length-1);
        page.name = name;
        page.num = 1;

        linkActors.classList.add('header__link-active');

        showActors(apiActors);
    });

    //обработчик на кнопку next

    nextArrow.addEventListener('click', () => {
        if(page.name == 'Actors') {
            deleteActors();
            console.log(page)

            page.num++;
            showActors(page.api + page.num);
        } else {
            // showActors(page.api);
            console.log(page)
            page.num++;
            deleteMovies();
            showMovies(page.api + page.num);
        }
    });

    
    // показ популярных фильмов
    showMovies(apiPopularMovies);
    colorGenres();



});

