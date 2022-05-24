import { useEffect, useState } from "react";
import { NoPoster } from "../Images";

interface MovieItem {
    name: string;
    productionYear: number;
    genre: string;
    synopsisShort: string;
    synopsis: string;
    image: string;
}


interface MovieItemError {
    message: string;
}
  
export default function MovieList() {

    const [movies, setMovies] = useState<MovieItem[]>([]);
    const [allMovies, setAllMovies] = useState<MovieItem[]>([]);
    const movieListUrl = "https://remarkable-bombolone-51a3d9.netlify.app/.netlify/functions/movies";

    const getMoviePoster = async (movie: MovieItem) => {
        const { name } = movie;
        const url  = `https://api.themoviedb.org/3/search/movie?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&query=${name}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            const { poster_path } = data.results[0];
            console.log(poster_path);
            return `http://image.tmdb.org/t/p/w342/${poster_path}`;
        } catch (error) {
            console.log(error);
        }
    }


    const getMovies  = async () => {
        const response = await fetch(movieListUrl);
        const data : MovieItem[] | MovieItemError = await response.json();
        if('message' in data || response.status !== 200) {
            // check if there is an error response
            console.log("Error getting movie info: Retrying")
            getMovies();
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

    const filterMovies = (year: number) => {
        console.log(year);
        if(year < 999) return setMovies(allMovies);
        if(!year) return setMovies(allMovies);
        setMovies(movies.filter(movie => {
            return movie.productionYear === year;
        }))
    }

    useEffect( () => {
        const fetchMovies = async () => {
            const result = await getMovies();
            if(result){
                setMovies(result);
                setAllMovies(result);
            }
        }
        fetchMovies();
    }, []);


    return (
      <div className="bg-white">
        <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Movie List</h2>
          <div className="flex">
                <div className="mb-3 xl:w-60">
                    <label  className="form-label inline-block mb-2 text-gray-700">Movie Year</label>
                    <input
                    type="textsearch"
                    className="
                        form-control
                        block
                        w-full
                        px-3
                        py-1.5
                        text-base
                        font-normal
                        text-gray-700
                        bg-white bg-clip-padding
                        border border-solid border-gray-300
                        rounded
                        transition
                        ease-in-out
                        m-0
                        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
                    "
                    placeholder="Enter the year of the movie"
                    onChange={(e) => filterMovies(parseInt(e.target.value))}
                    />
                </div>
        </div>
          <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {movies.map((movie, index) => (
              <div key={index} className="group relative">
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
            ))}
          </div>
        </div>
      </div>
    )
}
  