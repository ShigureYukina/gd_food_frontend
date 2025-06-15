const LOCAL_KEY = 'likedRecipeIds';

export const likeService = {
    getLikedIds() {
        return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
    },
    toggleLike(recipeId, likedIds) {
        const index = likedIds.indexOf(recipeId);
        const updated = [...likedIds];

        if (index > -1) {
            updated.splice(index, 1);
        } else {
            updated.push(recipeId);
        }

        localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
        return updated;
    },
    isLiked(recipeId, likedIds) {
        return likedIds.includes(recipeId);
    }
};
