import { useState, useEffect } from "react";

// Safe environment variable access
const getEnvVariable = (key, fallback) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

const API_KEY = getEnvVariable('NEXT_PUBLIC_OMDB_API_KEY', '4319d39e');
const BASE_URL = getEnvVariable('NEXT_PUBLIC_OMDB_API_URL', 'https://www.omdbapi.com/');

// Daftar film popular untuk default
const POPULAR_MOVIES = ["avengers", "batman", "spider-man", "star wars", "marvel"];

export const useMovies = (searchTerm = "", page = 1, sortBy = "", showPopular = false) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      // Jika searchTerm kosong tapi showPopular true, fetch film popular
      if (!searchTerm.trim() && showPopular) {
        setLoading(true);
        setError(null);
        
        try {
          // Fetch film pertama dari daftar popular
          const response = await fetch(
            `${BASE_URL}?apikey=${API_KEY}&s=${POPULAR_MOVIES[0]}&page=1`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch movies");
          }

          const data = await response.json();

          if (data.Response === "True") {
            // Ambil 8 film pertama untuk contoh
            const popularMovies = data.Search.slice(0, 8);
            setMovies(popularMovies);
            setTotalResults(0); // Set 0 karena ini bukan hasil search sebenarnya
          } else {
            setMovies([]);
            setTotalResults(0);
          }
        } catch (err) {
          setError(err.message);
          setMovies([]);
          setTotalResults(0);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Jika searchTerm kosong dan tidak showPopular, reset state
      if (!searchTerm.trim()) {
        setMovies([]);
        setTotalResults(0);
        setError(null);
        return;
      }

      // Normal search
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${BASE_URL}?apikey=${API_KEY}&s=${searchTerm}&page=${page}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }

        const data = await response.json();

        if (data.Response === "True") {
          let sortedMovies = data.Search;

          // Sorting logic
          if (sortBy === "year") {
            sortedMovies = sortedMovies.sort(
              (a, b) => parseInt(b.Year) - parseInt(a.Year)
            );
          } else if (sortBy === "title") {
            sortedMovies = sortedMovies.sort((a, b) =>
              a.Title.localeCompare(b.Title)
            );
          }

          setMovies(sortedMovies);
          setTotalResults(parseInt(data.totalResults));
        } else {
          setError(data.Error);
          setMovies([]);
          setTotalResults(0);
        }
      } catch (err) {
        setError(err.message);
        setMovies([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [searchTerm, page, sortBy, showPopular]);

  return { movies, loading, error, totalResults };
};

export const useMovieDetail = (id) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${BASE_URL}?apikey=${API_KEY}&i=${id}&plot=full`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch movie details");
        }

        const data = await response.json();

        if (data.Response === "True") {
          setMovie(data);
        } else {
          setError(data.Error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetail();
  }, [id]);

  return { movie, loading, error };
};