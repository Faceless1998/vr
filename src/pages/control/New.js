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

export default Control;  CHANGE THIS INFO INTO table excel form, and in front of it must be pencil sign where person press it , it must be popup with users full info like this example /* Control.module.css */

.control {
    padding: 20px;
    background-color: #e8f1f8; /* Light blue background */
    border-radius: 12px;
    width: fit-content;
    margin: 20px auto;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #2d3e50; /* Darker text color */   
  }
  
  ul{
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  h2 {
    color: #1b385d; /* Dark navy */
    font-size: 2em;
    text-align: center;
    margin-bottom: 25px;
    font-weight: 600;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
  }
  
  li {
    background-color: #ffffff;
    padding: 18px;
    border: 1px solid #d0e1f5;
    border-radius: 8px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.2s;
  }
  
  li:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .reservationInfo {
    color: #4a6572; /* Medium grey-blue */
    font-size: 1em;
    line-height: 1.5em;
    margin-top: 8px;
  }
  
  button {
    padding: 10px 14px;
    font-size: 0.9em;
    border-radius: 6px;
    margin-top: 6px;
    cursor: pointer;
    border: none;
    transition: background-color 0.3s, transform 0.1s;
  }
  
  button:hover {
    transform: translateY(-2px);
  }
  
  .cancelButton {
    background-color: #f76c6c; /* Soft red */
    color: white;
  }
  
  .cancelButton:hover {
    background-color: #f55454; /* Slightly darker red */
  }
  
  .doneButton {
    background-color: #3cb371; /* Soft green */
    color: white;
  }
  
  .doneButton:hover {
    background-color: #2e8b57; /* Slightly darker green */
  }
  
  button:disabled {
    background-color: #b0b8c3;
    cursor: not-allowed;
  }
  
  .cancelledText {
    color: #d9534f; /* Deep red */
    font-weight: 600;
  }
  
  .completedText {
    color: #5cb85c; /* Bright green */
    font-weight: 600;
  }
  
  /* Mobile adjustments */
  @media (max-width: 1200px) {
    .control {
      max-width: 700px;
      padding: 15px;
    }
    h2 {
      font-size: 1.8em;
    }
  }
  
  .reviewContainer {
    margin-top: 12px;
}

.reviewInput {
    width: 100%;
    height: 60px;
    border: 1px solid #d0e1f5;
    border-radius: 6px;
    padding: 10px;
    font-size: 0.9em;
    transition: border-color 0.3s;
}

.reviewInput:focus {
    border-color: #5cb85c; /* Green border on focus */
    outline: none; /* Remove default outline */
}

.updateButton {
  background-color: #007bff; /* Bootstrap blue */
  color: white;
  padding: 10px 14px;
  border-radius: 6px;
  margin-top: 8px;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s, transform 0.1s;
}

.updateButton:hover {
  background-color: #0056b3; /* Darker blue */
}


.gamediv{
  display: inline;
  margin-left: 10px;
}

.gamediv::after{
  content: ", ";
}