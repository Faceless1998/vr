import React, { useEffect, useState } from "react";
import styles from "./Customer.module.css";

export const Customer = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch("https://vr-back-efus.vercel.app
/api/reservations");
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

  const updateUserStatus = async (id) => {
    try {
      const reservation = reservations.find((res) => res._id === id);
      if (!reservation) {
        console.error("Reservation not found:", id);
        return;
      }

      const newStatus = reservation.userStatus === "Good" ? "Bad" : "Good";
      console.log("Updating reservation:", reservation);
      console.log("New status:", newStatus);

      const response = await fetch(
        `https://vr-back-efus.vercel.app/api/reservations/${id}/userstatus`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userStatus: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      const updatedReservation = await response.json();
      console.log("Updated reservation:", updatedReservation);

      setReservations((prevReservations) =>
        prevReservations.map((reservation) =>
          reservation._id === id ? updatedReservation : reservation
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return (
    <div className={styles.control}>
      <h2>User List</h2>
      {reservations.length === 0 ? (
        <p>No upcoming reservations.</p>
      ) : (
        <ul className={styles.reservationList}>
          {reservations.map((reservation) => (
            <li
              key={reservation._id}
              className={`${styles.reservationItem} ${
                reservation.userStatus === "Good" ? styles.good : styles.bad
              }`}
            >
              <p className={styles.reservationInfo}>
                {reservation.adultName} | {reservation.phone} <br />
              </p>
              <div className={styles.statusContainer}>
                <button
                  className={styles.goodButton}
                  onClick={() => updateUserStatus(reservation._id)}
                  aria-label="Toggle user status"
                >
                  <i className="fa-solid fa-check"></i>
                </button>
                <button
                  className={styles.badButton}
                  onClick={() => updateUserStatus(reservation._id)}
                  aria-label="Mark as bad"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
