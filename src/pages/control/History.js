import React, { useEffect, useState } from "react";
import styles from "./Control.module.css";

export const History = () => {
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

  // Function to group reservations by month and calculate total price for each month
  const calculateMonthlyTotals = () => {
    const monthlyTotals = {};

    reservations.forEach((reservation) => {
      const date = new Date(`${reservation.bookingDate}T${reservation.bookingHour}`);
      const month = date.toLocaleString("default", { month: "long", year: "numeric" }); // Format: "Month Year"
      const price = calculatePrice(reservation.duration);

      if (!monthlyTotals[month]) {
        monthlyTotals[month] = { total: 0, reservations: [] };
      }

      monthlyTotals[month].total += price;
      monthlyTotals[month].reservations.push(reservation);
    });

    return monthlyTotals;
  };

  // Calculate total earnings from all reservations
  const calculateTotalEarnings = () => {
    return reservations.reduce((total, reservation) => {
      return total + calculatePrice(reservation.duration);
    }, 0);
  };

  const monthlyTotals = calculateMonthlyTotals();
  const totalEarnings = calculateTotalEarnings();

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `https://vr-back-efus.vercel.app/api/reservations/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
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

    console.log(
      "Updating review for reservation ID:",
      id,
      "with review:",
      reservationToUpdate.review
    );

    try {
      const response = await fetch(
        `https://vr-back-efus.vercel.app/api/reservations/${id}/review`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ review: reservationToUpdate.review }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      const updatedReservation = await response.json();
      console.log("Updated reservation response:", updatedReservation);

      setReservations((prevReservations) =>
        prevReservations.map((reservation) =>
          reservation._id === id ? updatedReservation : reservation
        )
      );
    } catch (error) {
      console.error("Error updating reservation review:", error);
    }
  };

  const sortedReservations = reservations.sort((a, b) => {
    const dateA = new Date(`${a.bookingDate}T${a.bookingHour}`);
    const dateB = new Date(`${b.bookingDate}T${b.bookingHour}`);
    return dateA - dateB;
  });

  return (
    <div className={styles.control}>
      <h3>Monthly Total Prices</h3>
      <ul>
        {Object.entries(monthlyTotals).map(([month, { total }]) => (
          <li key={month}>
            {month}: 💵 Total Price: {total} ₾
          </li>
        ))}
      </ul>

      <h3>Total Earnings</h3>
      <ul>
      <li>💰 Total Earned: {totalEarnings} ₾ </li>
      </ul>
      <h2>Reservations</h2>
      <ul>
        {sortedReservations.map((reservation) => (
          <li key={reservation._id}>
            <span>
              {reservation.name} {reservation.surname}
            </span>
            <p className={styles.reservationInfo}>
              Parent - {reservation.adultName} | {reservation.AdultAge} <br />
              Kid - {reservation.KidName} | {reservation.KidAge} <br />
              📞 {reservation.phone} <br />
              📅 {reservation.bookingDate} at {reservation.bookingHour} <br />
              ⏳ Duration: {reservation.duration} Minutes <br />
              💵 Price: {calculatePrice(reservation.duration)} ₾
            </p>

            {reservation.games && reservation.games.length > 0 ? (
              <div className={styles.gameList}>
                Games: 
                  {reservation.games.map((game, index) => (
                    <div key={index} className={styles.gamediv}>{game || "Unknown Game"}</div>
                  ))}
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
                onClick={() => updateReview(reservation._id)}
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

      
    </div>
  );
};

export default History;
