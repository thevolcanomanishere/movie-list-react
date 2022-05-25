import { useEffect, useState } from "react";
import { NoPoster } from "../Images";
import { MovieItem } from "../types";
import MovieDetail from "./MovieDetail";
import MovieGenreFilter from "./MovieGenreFilter";
import MovieYearFilter from "./MovieYearFilter";

interface MovieItemError {
    message: string;
}
  
export default function MovieList() {

    const [movies, setMovies] = useState<MovieItem[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<MovieItem[]>([]);
    const [selectedYear, setSelectedYear] = useState<(number | string)>('All Years');
    const [selectedGenre, setSelectedGenre] = useState<string>('All Genres');
    const [uniqueYears, setUniqueYears] = useState<(number | string)[]>([]);
    const [uniqueGenres, setUniqueGenres] = useState<(string)[]>([]);
    const [movieDetailOpen, setMovieDetailOpen] = useState<boolean>(false);
    const [movieFocus, setMovieFocus] = useState<MovieItem | null>(null);

    const movieListUrl = "https://remarkable-bombolone-51a3d9.netlify.app/.netlify/functions/movies";

    const getMoviePoster = async (movie: MovieItem) => {
        const { name } = movie;
        const url  = `https://api.themoviedb.org/3/search/movie?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&query=${name}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            const { poster_path } = data.results[0];
            return `http://image.tmdb.org/t/p/w342/${poster_path}`;
        } catch (error) {
            console.error(error);
        }
    }

    useEffect( () => {
        const getMoviesWithPosters  = async () => {
            const response = await fetch(movieListUrl);
            const data : MovieItem[] | MovieItemError = await response.json();
            if('message' in data || response.status !== 200) {
                // check if there is an error response
                console.log("Error getting movie info: Retrying")
                getMoviesWithPosters();
            } else {
                const moviesWithPosters = await Promise.all(data.map(async (movie: MovieItem) => {
                    const poster = await getMoviePoster(movie);
                    if(poster){
                        return { ...movie, image: poster };
                    } else {
                        // If no poster, return the default image
                        return {...movie, image: NoPoster};
                    }
                }));
                return await moviesWithPosters;
            }
        };

        const fetchMovies = async () => {
            const result = await getMoviesWithPosters();
            if(result){
                setMovies(result);
                setFilteredMovies(result);
                setUniqueYears([
                    'All Years',
                    ...result.map(movie => movie.productionYear).filter((year, index, years) => years.indexOf(year) === index).sort()
                ]);
                setUniqueGenres([
                    'All Genres',
                    ...result.map(movie => movie.genre).filter((genre, index, genres) => genres.indexOf(genre) === index)
                ]);
                setSelectedYear('All Years');
            }
        }
        fetchMovies();
    }, []);

    useEffect( () => { 
        const filterMovies = () => {
            const filtered = movies.filter(movie => {
                if(selectedYear === 'All Years' && selectedGenre !== 'All Genres') return movie.genre === selectedGenre;
                if(selectedGenre === 'All Genres' && selectedYear !== 'All Years') return movie.productionYear === selectedYear;
                if(selectedYear === 'All Years' && selectedGenre === 'All Genres') return movie;
                return (movie.genre === selectedGenre && movie.productionYear === selectedYear);
            });
            setFilteredMovies(filtered);
        }
        filterMovies();
    }, [selectedYear, selectedGenre, movies]);

    useEffect( () => {
        console.log('Open');
        setMovieDetailOpen(true);
    }, [movieFocus]);

    const renderMovie = (movie: MovieItem, index: number) => {
        return (
            <div key={index} onClick={() => setMovieFocus(movie)} className="group relative">
              <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:aspect-none">
                <img
                  src={movie.image}
                  alt={movie.synopsisShort}
                  className="w-full h-full object-center object-cover lg:w-full lg:h-full"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                      <span aria-hidden="true" className="absolute inset-0" />
                      {movie.name}
                  </h3>
                </div>
                <p className="text-sm font-medium text-gray-900">Year: {movie.productionYear}</p>
              </div>
            </div>
        )
    }

    const renderAllMovies = () => {
        if(filteredMovies.length === 0) return <p>No movies found</p>
        return filteredMovies.map(renderMovie);
    }

    return (
      <div className="bg-white">
        <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-10">Movie List</h2>
          <div className="flex">
                <MovieYearFilter years={uniqueYears} setSelectedYear={setSelectedYear}/>
                <MovieGenreFilter genres={uniqueGenres} setSelectedGenre={setSelectedGenre}/>
        </div>
            {(movieDetailOpen && movieFocus) && (
                <MovieDetail movieItem={movieFocus} isOpenParent={movieDetailOpen} setClosedParent={setMovieDetailOpen}/>
            )}
          <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {renderAllMovies()}
          </div>
        </div>
      </div>
    )
}
  