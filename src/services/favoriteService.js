const LOCAL_KEY = 'favoriteRecipeIds';

export const favoriteService = {
    getFavoriteIds() {
        return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
    },
    toggleFavorite(recipeId, favoriteIds) {
        const index = favoriteIds.indexOf(recipeId);
        const updated = [...favoriteIds];

        if (index > -1) {
            updated.splice(index, 1);
        } else {
            updated.push(recipeId);
        }

        localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
        return updated;
    },
    isFavorite(recipeId, favoriteIds) {
        return favoriteIds.includes(recipeId);
    }
};
