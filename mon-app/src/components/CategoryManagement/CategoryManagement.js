import React from 'react';
import './CategoryManagement.css';

function CategoryManagement({
  categoryInput, setCategoryInput,
  categoryDescription, setCategoryDescription,
  categoryColor, setCategoryColor,
  categoryIcon, setCategoryIcon,
  editingCategoryId, setEditingCategoryId,
  categories,
  categoryFilter, setCategoryFilter,
  handleCategorySubmit,
  resetCategoryForm,
  startEditCategory,
  deleteCategory
}) {
  return (
    <div className="category-management">
      <h2>Gestion des catégories</h2>
      
      <form onSubmit={handleCategorySubmit}>
        <input
          type="text"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          placeholder="Titre de la catégorie"
          required
        />
        <input
          type="text"
          value={categoryDescription}
          onChange={(e) => setCategoryDescription(e.target.value)}
          placeholder="Description"
        />
        <div className="color-picker">
          <label>Couleur:</label>
          <input
            type="color"
            value={categoryColor}
            onChange={(e) => setCategoryColor(e.target.value)}
          />
        </div>
        <input
          type="text"
          value={categoryIcon}
          onChange={(e) => setCategoryIcon(e.target.value)}
          placeholder="Icône (emoji ou texte)"
        />
        <button type="submit">
          {editingCategoryId ? 'Mettre à jour' : 'Ajouter'}
        </button>
        {editingCategoryId && (
          <button type="button" onClick={resetCategoryForm}>
            Annuler
          </button>
        )}
      </form>
      
      {/* Categories List */}
      <div className="categories-list">
        <h3>Liste des catégories</h3>
        <ul>
          {categories.map((category) => (
            <li 
              key={category.id}
              className={`category-item ${categoryFilter === category.id ? 'category-selected' : ''}`}
              style={{ borderLeft: `5px solid ${category.color || 'gray'}` }}
            >
              <div onClick={() => setCategoryFilter(categoryFilter === category.id ? null : category.id)} 
                   className="category-content">
                <strong>{category.title}</strong> {category.icon && <span>{category.icon}</span>}
                {category.description && <p>{category.description}</p>}
              </div>
              <div className="category-actions">
                <button onClick={() => startEditCategory(category)}>
                  Modifier
                </button>
                <button onClick={() => deleteCategory(category.id)}>
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CategoryManagement;
