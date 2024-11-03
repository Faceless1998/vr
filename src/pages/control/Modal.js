import React, { useState } from "react";
import styles from "./Modal.module.css";

const Modal = ({ reservation, onClose, updateStatus, updateReview }) => {
  const [review, setReview] = useState(reservation.review || "");

  const handleReviewUpdate = () => {
    updateReview(reservation._id, review);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Reservation Details</h2>
        <p>
          <strong>Name:</strong> {reservation.name} {reservation.surname}
        </p>
        <p>
          <strong>Parent:</strong> {reservation.adultName}
        </p>
        <p>
          <strong>Kid:</strong> {reservation.KidName}
        </p>
        <p>
          <strong>Phone:</strong> {reservation.phone}
        </p>
        <p>
          <strong>Booking Date:</strong> {reservation.bookingDate} at{" "}
          {reservation.bookingHour}
        </p>
        <p>
          <strong>Duration:</strong> {reservation.duration} Minutes
        </p>
        <p>
          <strong>Games:</strong>{" "}
          {reservation.games?.join(", ") || "No games associated"}
        </p>

        <div className={styles.reviewContainer}>
          <textarea
            className={styles.reviewInput}
            placeholder="Add a review description..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <button onClick={handleReviewUpdate}>Update Review</button>
        </div>

        {reservation.status === "Pending" ? (
          <>
            <button
              className={styles.cancelButton}
              onClick={() => updateStatus(reservation._id, "Cancelled")}
            >
              Delete Reservation
            </button>
            <button
              className={styles.doneButton}
              onClick={() => updateStatus(reservation._id, "Completed")}
            >
              Complete Reservation
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

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
