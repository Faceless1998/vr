import React, { useState, useEffect } from "react";
import styles from "./user.module.css";

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="green"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="red"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const Users = () => {
  const [formData, setFormData] = useState({
    adultName: "",
    KidName: "",
    phone: "",
    AdultAge: 0,
    KidAge: 0,
    bookingDate: "",
    bookingHour: "",
    duration: "",
    games: [],
    review:"",
    userStatus:"",
    price:0
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingReservations, setExistingReservations] = useState([]);
  const [gameOptions, setGameOptions] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState("");

  // Game selection state to hold games selected across categories
  const [selectedGames, setSelectedGames] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://vr-back-efus.vercel.app
/api/reservations");
        const data = await response.json();
        setExistingReservations(data);
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://vr-back-efus.vercel.app
/api/categories");
        const data = await response.json();
        if (Array.isArray(data)) {
          const allGamesCategory = { _id: "all", name: "All Games" };
          setCategories([allGamesCategory, ...data]);
        } else {
          console.error("Unexpected response format for categories:", data);
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchGames = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://vr-back-efus.vercel.app
/api/games");
        const data = await response.json();
        if (Array.isArray(data)) {
          setGameOptions(data);
          setFilteredGames(data); // Show all games initially
        } else {
          console.error("Unexpected response format for games:", data);
          setGameOptions([]);
          setFilteredGames([]);
        }
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
    fetchCategories();
    fetchGames();
  }, []);

  useEffect(() => {
    const filteredGames =
      selectedCategory === "all"
        ? gameOptions
        : gameOptions.filter((game) => {
            return (
              Array.isArray(game.categoryIds) &&
              game.categoryIds.some(
                (category) => category._id === selectedCategory
              )
            );
          });

    console.log("Filtered Games:", filteredGames);
    setFilteredGames(filteredGames);
  }, [selectedCategory, gameOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCategoryClick = (categoryId) => {
    console.log("Selected Category ID:", categoryId);
    setSelectedCategory(categoryId);
  };

  const handleGameToggle = (gameName) => {
    setSelectedGames((prevGames) => {
      return prevGames.includes(gameName)
        ? prevGames.filter((selectedGameName) => selectedGameName !== gameName)
        : [...prevGames, gameName];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const durationMinutes = parseInt(formData.duration);
    const bookingTime = new Date(
      `${formData.bookingDate}T${formData.bookingHour}`
    );
    const endTime = new Date(bookingTime.getTime() + durationMinutes * 60000);

    const isOverlapping = existingReservations.some((reservation) => {
      const reservationStart = new Date(
        reservation.bookingDate + "T" + reservation.bookingHour
      );
      const reservationEnd = new Date(
        reservationStart.getTime() + reservation.duration * 60000
      );
      const isCancelled = reservation.status === "Cancelled";

      return (
        !isCancelled &&
        ((bookingTime >= reservationStart && bookingTime < reservationEnd) ||
          (endTime > reservationStart && endTime <= reservationEnd) ||
          (bookingTime <= reservationStart && endTime >= reservationEnd))
      );
    });

    if (isOverlapping) {
      setError(
        "This time slot is already booked. Please choose a different time."
      );
      return;
    }

    const confirmSubmit = window.confirm(
      "Are you sure you want to book this game?"
    );
    if (!confirmSubmit) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch("https://vr-back-efus.vercel.app/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          duration: durationMinutes,
          games: selectedGames, // Use the selected games state
        }),
      });

      if (!response.ok) throw new Error("Failed to save reservation");

      const newReservation = await response.json();
      setExistingReservations((prev) => [...prev, newReservation]);
      setSubmitted(true);
    } catch (error) {
      setError("Error saving reservation: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.main}>
      <h2 className={styles.title}>Book a Game</h2>
      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {submitted ? (
        <p>Thank you for booking! We’ll be in touch soon.</p>
      ) : (
        <form className={styles.container} onSubmit={handleSubmit}>
          <div className={styles.former}>
            <div className={styles.column}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Parent's name:</label>
                <input
                  type="text"
                  id="adultName"
                  name="adultName"
                  value={formData.adultName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="name">Kid's Name:</label>
                <input
                  type="text"
                  id="KidName"
                  name="KidName"
                  value={formData.KidName}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Parent's Age:</label>
                <input
                  type="number"
                  id="AdultAge"
                  name="AdultAge"
                  value={formData.AdultAge}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Kid's Age:</label>
                <input
                  type="number"
                  id="KidAge"
                  name="KidAge"
                  value={formData.KidAge}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="bookingDate">Booking Date:</label>
                <input
                  type="date"
                  id="bookingDate"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="bookingHour">Booking Hour:</label>
                <input
                  type="time"
                  id="bookingHour"
                  name="bookingHour"
                  value={formData.bookingHour}
                  onChange={handleChange}
                  required
                  min="10:00"
                  max="22:00"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="duration">Duration:</label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Duration</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hours</option>
                </select>
              </div>
            </div>
            <div className={styles.column}>
              <div className={styles.formGroup}>
                <label>Select Category:</label>
                <div className={styles.categoryContainer}>
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className={styles.categoryItem}
                      onClick={() => handleCategoryClick(category._id)}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
              <div
                className={`${styles.formGroup} ${styles.scrollableGameOptions}`}
              >
                <label>Select Games:</label>
                <div className={styles.gameContainer}>
                  {filteredGames.map((game) => (
                    <div key={game.name} className={styles.gameItem}>
                      <span
                        onClick={() => handleGameToggle(game.name)}
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          padding: "5px",
                        }}
                      >
                        {selectedGames.includes(game.name) ? (
                          <CheckIcon />
                        ) : (
                          <XIcon />
                        )}
                        <span style={{ marginLeft: "8px" }}>{game.name}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};
