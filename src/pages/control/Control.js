import React, { useEffect, useState } from "react";
import Modal from "./Modal"; // Adjust the path if needed
import styles from "./Control.module.css";

export const Control = () => {
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Fetch reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch("https://vr-back-efus.vercel.app/api/reservations");
        if (!response.ok) throw new Error("Failed to fetch reservations");
        const data = await response.json();
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
    switch (duration) {
      case 30: return 10;
      case 60: return 15;
      case 90: return 30;
      default: return 0;
    }
  };

  const now = new Date();
  const futureReservations = reservations.filter((reservation) => {
    const reservationDate = new Date(`${reservation.bookingDate}T${reservation.bookingHour}`);
    return (
      reservationDate > now &&
      reservation.status !== "Cancelled" &&
      reservation.status !== "Completed"
    );
  });

  const sortedReservations = futureReservations.sort((a, b) => {
    const dateA = new Date(`${a.bookingDate}T${a.bookingHour}`);
    const dateB = new Date(`${b.bookingDate}T${b.bookingHour}`);
    return dateA - dateB;
  });

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`https://vr-back-efus.vercel.app/api/reservations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, price: calculatePrice(status === "Completed" ? 60 : 0) }), // Adjust according to your needs
      });

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

  const updateReview = async (id, review) => {
    try {
      const response = await fetch(`https://vr-back-efus.vercel.app/api/reservations/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review }),
      });

      if (!response.ok) throw new Error("Failed to update review");
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

  return (
    <div className={styles.control}>
      <h2>Upcoming Reservations</h2>
      {sortedReservations.length === 0 ? (
        <p>No upcoming reservations.</p>
      ) : (
        <table className={styles.reservationTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Parent</th>
              <th>Kid</th>
              <th>Phone</th>
              <th>Date & Time</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedReservations.map((reservation) => (
              <tr key={reservation._id}>
                <td>{reservation.name} {reservation.surname}</td>
                <td>{reservation.adultName}</td>
                <td>{reservation.KidName}</td>
                <td>{reservation.phone}</td>
                <td>{`${reservation.bookingDate} at ${reservation.bookingHour}`}</td>
                <td>{reservation.duration} Minutes</td>
                <td>{calculatePrice(reservation.duration)}</td>
                <td>
                  <button onClick={() => setSelectedReservation(reservation)}>✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedReservation && (
        <Modal
          setReservations={setReservations}
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          updateStatus={updateStatus}
          updateReview={updateReview}
        />
      )}
    </div>
  );
};
