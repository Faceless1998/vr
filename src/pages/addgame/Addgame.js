import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Addgame.module.css"; // Adjust the path as necessary
import { AddCategory } from "./Addcategory";

export const AddGame = () => {
  const [gameName, setGameName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]); // State to hold categories
  const [selectedCategories, setSelectedCategories] = useState([]); // State to hold selected categories

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://vr-back-efus.vercel.app/api/categories"
        );
        setCategories(response.data); // Assume response.data contains the categories array
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []); // Run once on mount

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", gameName);
    formData.append("image", imageFile); // Append the image file
    formData.append("categoryIds", JSON.stringify(selectedCategories)); // Sending as a JSON string

    try {
      const response = await axios.post(
        "https://vr-back-efus.vercel.app/api/games",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Game added:", response.data);
      // Reset the form fields
      setGameName("");
      setImageFile(null);
      setSelectedCategories([]); // Reset selected categories
    } catch (error) {
      console.error("Error adding game:", error);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategories((prevSelected) => {
      // Toggle selection
      if (prevSelected.includes(categoryId)) {
        return prevSelected.filter((id) => id !== categoryId); // Remove if already selected
      } else {
        return [...prevSelected, categoryId]; // Add if not selected
      }
    });
  };

  return (
    <div className={styles.bots}>
      <div className={styles.botsitem}>
        <div className={styles.container}>
          <h2>Add a New Game</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="gameName">Game Name:</label>
              <input
                type="text"
                id="gameName"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="imageFile">Upload Image:</label>
              <input
                type="file"
                id="imageFile"
                accept="image/*" // Accept only image files
                onChange={(e) => setImageFile(e.target.files[0])}
                required
              />
            </div>
            <div className={styles.categoryContainer}>
              <label>Categories:</label>
              <div className={styles.categoryList}>
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className={`${styles.categoryItem} ${
                      selectedCategories.includes(category._id)
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() => handleCategoryClick(category._id)}
                  >
                    {category.name}
                  </div>
                ))}
              </div>
            </div>
            <button type="submit">Add Game</button>
          </form>
        </div>
      </div>
      <div className={styles.botsitem}>
        <AddCategory />
      </div>
    </div>
  );
};
