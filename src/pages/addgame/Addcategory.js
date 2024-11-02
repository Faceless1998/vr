// AddCategory.js
import React, { useState } from 'react';
import axios from 'axios';
import styles from './AddCategory.module.css'; // Adjust the path as necessary

export const AddCategory = () => {
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://vr-back-efus.vercel.app/api/categories', {
        name: categoryName,
      });
      console.log('Category added:', response.data);
      // Reset the form field
      setCategoryName('');
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Add a New Category</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="categoryName">Category Name:</label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Category</button>
      </form>
    </div>
  );
};
