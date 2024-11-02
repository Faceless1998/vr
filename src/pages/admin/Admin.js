import React from "react";
import styles from "./admin.module.css";
import { Link } from "react-router-dom";

export const Admin = () => {
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <Link to="control">
          <div className={styles.cube1}>
            <i class="fa-solid fa-puzzle-piece"></i>
            <span>Upcoming</span>
          </div>
        </Link>
        <Link to="add">
          <div className={styles.cube2}>
            <i class="fa-solid fa-plus"></i>
            <span>Add Games</span>
          </div>
        </Link>

        <Link to="history">
          <div className={styles.cube2}>
            <i class="fa-solid fa-clock-rotate-left"></i>
            <span>History</span>
          </div>
        </Link>

        <Link to="costumers">
          <div className={styles.cube2}>
            <i class="fa-solid fa-list-check"></i>
            <span>Costumers</span>
          </div>
        </Link>
      </div>
    </div>
  );
};
