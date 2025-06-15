// services/likeService.js
const STORAGE_KEY = 'likedRecipeIds';

function getLikedIds() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function isLiked(recipeId, likedIds) {
    return likedIds.includes(recipeId);
}

function toggleLike(recipeId, likedIds) {
    const index = likedIds.indexOf(recipeId);
    let updated;
    if (index > -1) {
        updated = [...likedIds.slice(0, index), ...likedIds.slice(index + 1)];
    } else {
        updated = [...likedIds, recipeId];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
}

export const likeService = {
    getLikedIds,
    isLiked,
    toggleLike
};
