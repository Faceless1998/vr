import React, { useEffect, useState } from "react";
import styles from "./Control.module.css";

export const Control = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch("https://vr-back-efus.vercel.app/api/reservations");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Fetched reservations:", data);
        setReservations(data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
    const intervalId = setInterval(fetchReservations, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const calculatePrice = (duration) => {
    if (duration === 30) return 10;
    if (duration === 60) return 15;
    if (duration === 90) return 30;
    return 0; // Fallback price
  };

  const updateStatus = async (id, status) => {
    try {
      const reservationToUpdate = reservations.find(
        (reservation) => reservation._id === id
      );

      if (!reservationToUpdate) return;

      let price;
      if (status === "Completed") {
        price = calculatePrice(reservationToUpdate.duration); // Calculate price for completed reservations
      } else {
        price = 0; // Set price to 0 if cancelled
      }

      console.log(`Updating reservation ID: ${id} | Status: ${status} | Price: ${price}`);

      const response = await fetch(
        `https://vr-back-efus.vercel.app/api/reservations/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, price }), // Include the price in the request body
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      const updatedReservation = await response.json();

      setReservations((prevReservations) =>
        prevReservations.map((reservation) =>
          reservation._id === id ? updatedReservation : reservation
        )
      );
    } catch (error) {
      console.error("Error updating reservation status:", error);
    }
  };

  const handleReviewChange = (id, review) => {
    setReservations((prevReservations) =>
      prevReservations.map((reservation) =>
        reservation._id === id ? { ...reservation, review } : reservation
      )
    );
  };

  const updateReview = async (id) => {
    const reservationToUpdate = reservations.find(
      (reservation) => reservation._id === id
    );
    if (!reservationToUpdate) return;

    try {
      const response = await fetch(
        `https://vr-back-efus.vercel.app/api/reservations/${id}/review`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ review: reservationToUpdate.review }), // Ensure the review field is correct
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      const updatedReservation = await response.json();

      setReservations((prevReservations) =>
        prevReservations.map((reservation) =>
          reservation._id === id ? updatedReservation : reservation
        )
      );
    } catch (error) {
      console.error("Error updating reservation review:", error);
    }
  };

  // Get the current date and time
  const now = new Date();

  // Filter to get only future reservations that are not Cancelled or Completed
  const futureReservations = reservations.filter((reservation) => {
    const reservationDate = new Date(`${reservation.bookingDate}T${reservation.bookingHour}`);
    return reservationDate > now && reservation.status !== "Cancelled" && reservation.status !== "Completed";
  });

  const sortedReservations = futureReservations.sort((a, b) => {
    const dateA = new Date(`${a.bookingDate}T${a.bookingHour}`);
    const dateB = new Date(`${b.bookingDate}T${b.bookingHour}`);
    return dateA - dateB;
  });

  return (
    <div className={styles.control}>
      <h2>Upcoming Reservations</h2>
      {sortedReservations.length === 0 ? (
        <p>No upcoming reservations.</p> // Display a message if there are no future reservations
      ) : (
        <ul>
          {sortedReservations.map((reservation) => (
            <li key={reservation._id}>
              <span>
                {reservation.name} {reservation.surname}
              </span>
              <p className={styles.reservationInfo}>
                Parent - {reservation.adultName} | {reservation.AdultAge} <br />
                Kid - {reservation.KidName} | {reservation.KidAge}
                <br />
                📞 {reservation.phone} <br />
                📅 {reservation.bookingDate} at {reservation.bookingHour} <br />⏳
                Duration: {reservation.duration} Minutes <br />
                💵 Price: {calculatePrice(reservation.duration)} ₾ <br /> {/* Display the price */}
              </p>

              {reservation.games && reservation.games.length > 0 ? (
                <div className={styles.gameList}>
                  <h4>Games:</h4>
                  <ul>
                    {reservation.games.map((game, index) => (
                      <li key={index}>{game || "Unknown Game"}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No games associated with this reservation.</p>
              )}
              <div className={styles.reviewContainer}>
                {reservation.review ? (
                  <p className={styles.reviewText}>
                    <strong>Review:</strong> {reservation.review}
                  </p>
                ) : (
                  <p>No review available.</p>
                )}
                <textarea
                  className={styles.reviewInput}
                  placeholder="Add a review description..."
                  value={reservation.review || ""}
                  onChange={(e) =>
                    handleReviewChange(reservation._id, e.target.value)
                  }
                />
                <button
                  className={styles.updateButton}
                  onClick={() => updateReview(reservation._id)} // Calls updateReview when clicked
                >
                  Update Review
                </button>
              </div>
              {reservation.status === "Pending" ? (
                <>
                  <button
                    className={styles.cancelButton}
                    onClick={() => updateStatus(reservation._id, "Cancelled")}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.doneButton}
                    onClick={() => updateStatus(reservation._id, "Completed")}
                  >
                    Done
                  </button>
                </>
              ) : (
                <p
                  className={
                    reservation.status === "Cancelled"
                      ? styles.cancelledText
                      : styles.completedText
                  }
                >
                  {reservation.status}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );  
};

export default Control;
