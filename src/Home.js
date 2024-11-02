import React from "react";
import styles from "./Home.module.css";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate

export const Home = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <div className={styles.main}>
      <div className={styles.title}>Vr Discovery</div>
      <div className={styles.container}>
        <Link to="users">
          <div className={styles.cube1}>
            <i className="fa-solid fa-user-plus"></i> <span>User</span>
          </div>
        </Link>
        <Link to="admin">
          <div className={styles.cube2}>
            <i className="fa-solid fa-user-tie"></i>
            <span>Admin</span>
          </div>
        </Link>
      </div>
      
    </div>
  );
};
