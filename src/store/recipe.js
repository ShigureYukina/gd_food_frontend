import {defineStore} from 'pinia'
import {ElMessage} from 'element-plus';
import {useGlobalStore} from './global';
import MOCK_DATA from '../utils/mock-data';

export const useRecipeStore = defineStore("recipe", {
    state: () => ({
        recipes: [],
        comments: {},
        isLoading: false,
        likedRecipeIds: JSON.parse(localStorage.getItem('likedRecipeIds')) || [],
        favoriteRecipeIds: JSON.parse(localStorage.getItem('favoriteRecipeIds')) || [],
    }),
    getters: {
        getRecipeById: (state) => (id) => {
            // Note: ID can be a number or a string, so we compare them uniformly
            return state.recipes.find(r => String(r.id) === String(id));
        },
        getCommentsByRecipeId: (state) => (recipeId) => {
            return state.comments[recipeId] || [];
        },
        favoriteRecipes: (state) => {
            return state.recipes.filter(r => state.favoriteRecipeIds.includes(r.id));
        },
        isFavorite: (state) => (recipeId) => {
            return state.favoriteRecipeIds.includes(recipeId);
        },
        isLiked: (state) => (recipeId) => {
            return state.likedRecipeIds.includes(recipeId);
        },
    },
    actions: {
        async fetchRecipes() {
            if (this.recipes.length > 0) return; // Avoid duplicate fetching
            this.isLoading = true;
            try {
                // Simulate API call
                await new Promise(res => setTimeout(res, 500));

                // 1. Create a user ID to username map for efficiency
                const userMap = MOCK_DATA.users.reduce((acc, user) => {
                    acc[user.UserID] = user.Username;
                    return acc;
                }, {});

                // 2. Calculate initial favorite counts for each recipe
                const favoriteCounts = MOCK_DATA.collections.reduce((acc, collection) => {
                    acc[collection.RecipeID] = (acc[collection.RecipeID] || 0) + 1;
                    return acc;
                }, {});

                // 3. Transform recipe data
                this.recipes = MOCK_DATA.recipes.map(recipe => {
                    let coverImage = `https://placehold.co/600x400/cccccc/ffffff?text=${encodeURI(recipe.Title)}`;
                    try {
                        const images = JSON.parse(recipe.ImageLinks);
                        if (images && images.length > 0) {
                            coverImage = images[0];
                        }
                    } catch (e) {
                        console.error(`Error parsing image links for recipe ${recipe.RecipeID}:`, e);
                    }

                    // 从 MOCK_DATA.stories 中查找对应的故事
                    const storyData = MOCK_DATA.stories.find(s => s.RecipeID === recipe.RecipeID);

                    return {
                        id: recipe.RecipeID,
                        title: recipe.Title,
                        description: recipe.Description,
                        recipetypeid : recipe.RecipetypeId,
                        recipetypename: recipe.RecipetypeName,
                        ingredients: JSON.parse(recipe.Ingredients),
                        steps: JSON.parse(recipe.Steps),
                        difficulty: recipe.Difficulty,
                        createdAt: recipe.UploadTime,
                        authorId: recipe.UserID,
                        authorName: userMap[recipe.UserID] || 'Anonymous',
                        coverImage: coverImage,
                        likes: Math.floor(Math.random() * 200),
                        favorites: favoriteCounts[recipe.RecipeID] || 0,
                        // 添加 story 字段
                        story: storyData ? `${storyData.HistoricalContext}\n\n${storyData.CulturalSignificance || ''}`.trim() : null,
                    };
                });

                // 4. Transform comment data
                this.comments = MOCK_DATA.reviews.reduce((acc, review) => {
                    const {RecipeID} = review;
                    if (!acc[RecipeID]) {
                        acc[RecipeID] = [];
                    }
                    acc[RecipeID].push({
                        commentId: review.ReviewID,
                        recipeId: review.RecipeID,
                        userId: review.UserID,
                        username: userMap[review.UserID] || 'Anonymous',
                        content: review.Comment,
                        createdAt: review.ReviewTime,
                        rating: review.Rating,
                    });
                    return acc;
                }, {});

            } catch (error) {
                console.error('Error fetching or processing data:', error);
                ElMessage.error('Failed to fetch recipe data. Please try again later.');
            } finally {
                this.isLoading = false;
            }
        },
        addRecipe(recipeData) {
            const globalStore = useGlobalStore();
            const newRecipe = {
                id: 'recipe-' + Date.now(),
                ...recipeData,
                authorId: globalStore.userId,
                authorName: "Me",
                createdAt: new Date().toISOString().slice(0, 10),
                likes: 0,
                favorites: 0,
                coverImage: `https://placehold.co/600x400/cccccc/ffffff?text=${encodeURI(recipeData.title)}`
            };
            this.recipes.unshift(newRecipe);
            ElMessage.success('Recipe shared successfully!');
        },
        addComment(recipeId, commentContent) {
            const globalStore = useGlobalStore();
            const newComment = {
                commentId: 'comment-' + Date.now(),
                recipeId,
                userId: globalStore.userId,
                username: 'Me',
                content: commentContent,
                createdAt: new Date().toISOString().slice(0, 10),
            };

            if (!this.comments[recipeId]) {
                this.comments[recipeId] = [];
            }
            this.comments[recipeId].push(newComment);
            ElMessage.success('Comment posted successfully');
        },
        toggleLike(recipeId) {
            const index = this.likedRecipeIds.indexOf(recipeId);
            const recipe = this.recipes.find(r => String(r.id) === String(recipeId));
            if (index > -1) {
                this.likedRecipeIds.splice(index, 1);
                if (recipe) recipe.likes--;
            } else {
                this.likedRecipeIds.push(recipeId);
                if (recipe) recipe.likes++;
                ElMessage({message: 'Liked!', type: 'success', plain: true});
            }
            localStorage.setItem('likedRecipeIds', JSON.stringify(this.likedRecipeIds));
        },
        toggleFavorite(recipeId) {
            const index = this.favoriteRecipeIds.indexOf(recipeId);
            const recipe = this.recipes.find(r => String(r.id) === String(recipeId));
            if (index > -1) {
                this.favoriteRecipeIds.splice(index, 1);
                if (recipe) recipe.favorites--;
                ElMessage({message: 'Removed from favorites', type: 'warning', plain: true});
            } else {
                this.favoriteRecipeIds.push(recipeId);
                if (recipe) recipe.favorites++;
                ElMessage({message: 'Added to favorites', type: 'success', plain: true});
            }
            localStorage.setItem('favoriteRecipeIds', JSON.stringify(this.favoriteRecipeIds));
        },
    },
});