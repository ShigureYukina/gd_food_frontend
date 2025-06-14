import {defineStore} from 'pinia';
import {ElMessage} from 'element-plus';
import {useGlobalStore} from './global';
import {userService} from '../services/userService'; // 引入 userService
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
            if (this.recipes.length > 0) return;
            this.isLoading = true;
            try {
                await new Promise(res => setTimeout(res, 500));

                const favoriteCounts = MOCK_DATA.collections.reduce((acc, collection) => {
                    acc[collection.RecipeID] = (acc[collection.RecipeID] || 0) + 1;
                    return acc;
                }, {});

                this.recipes = MOCK_DATA.recipes.map(recipe => {
                    let coverImage = `https://placehold.co/600x400/cccccc/ffffff?text=${encodeURI(recipe.Title)}`;
                    try {
                        const images = JSON.parse(recipe.ImageLinks);
                        if (images && images.length > 0) {
                            coverImage = images[0];
                        }
                    } catch (e) {
                        console.error(`解析菜谱 ${recipe.RecipeID} 的图片链接时出错:`, e);
                    }

                    const storyData = MOCK_DATA.stories.find(s => s.RecipeID === recipe.RecipeID);

                    return {
                        id: recipe.RecipeID,
                        title: recipe.Title,
                        description: recipe.Description,
                        recipetypeid: recipe.RecipetypeId,
                        recipetypename: recipe.RecipetypeName,
                        ingredients: JSON.parse(recipe.Ingredients),
                        steps: JSON.parse(recipe.Steps),
                        difficulty: recipe.Difficulty,
                        createdAt: recipe.UploadTime,
                        authorId: recipe.UserID,
                        authorName: userService.getUserName(recipe.UserID), // 使用 userService
                        coverImage: coverImage,
                        likes: Math.floor(Math.random() * 200),
                        favorites: favoriteCounts[recipe.RecipeID] || 0,
                        status: recipe.Status,
                        story: storyData ? `${storyData.HistoricalContext}\n\n${storyData.CulturalSignificance || ''}`.trim() : null,
                    };
                });

                this.comments = MOCK_DATA.reviews.reduce((acc, review) => {
                    const {RecipeID} = review;
                    if (!acc[RecipeID]) {
                        acc[RecipeID] = [];
                    }
                    acc[RecipeID].push({
                        commentId: review.ReviewID,
                        recipeId: review.RecipeID,
                        userId: review.UserID,
                        username: userService.getUserName(review.UserID), // 使用 userService
                        content: review.Comment,
                        createdAt: review.ReviewTime,
                        rating: review.Rating,
                    });
                    return acc;
                }, {});

            } catch (error) {
                console.error('获取或处理数据时出错:', error);
                ElMessage.error('获取菜谱数据失败，请稍后重试。');
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
                authorName: "我",
                createdAt: new Date().toISOString().slice(0, 10),
                likes: 0,
                favorites: 0,
                status: 'pending',
                coverImage: `https://placehold.co/600x400/cccccc/ffffff?text=${encodeURI(recipeData.title)}`
            };
            this.recipes.unshift(newRecipe);
            ElMessage.success('菜谱分享成功！');
        },
        addComment(recipeId, commentContent) {
            const globalStore = useGlobalStore();
            const currentUser = userService.getUserById(globalStore.userId); // 使用 userService

            const newComment = {
                commentId: 'comment-' + Date.now(),
                recipeId,
                userId: globalStore.userId,
                username: userService.getUserName(globalStore.userId), // 使用 userService
                avatar: userService.getUserAvatar(globalStore.userId), // 使用 userService
                content: commentContent,
                createdAt: new Date().toISOString().slice(0, 10),
            };

            if (!this.comments[recipeId]) {
                this.comments[recipeId] = [];
            }
            this.comments[recipeId].push(newComment);
            ElMessage.success('评论发布成功');
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
                ElMessage({message: '已点赞！', type: 'success', plain: true});
            }
            localStorage.setItem('likedRecipeIds', JSON.stringify(this.likedRecipeIds));
        },
        toggleFavorite(recipeId) {
            const index = this.favoriteRecipeIds.indexOf(recipeId);
            const recipe = this.recipes.find(r => String(r.id) === String(recipeId));
            if (index > -1) {
                this.favoriteRecipeIds.splice(index, 1);
                if (recipe) recipe.favorites--;
                ElMessage({message: '已从收藏夹移除', type: 'warning', plain: true});
            } else {
                this.favoriteRecipeIds.push(recipeId);
                if (recipe) recipe.favorites++;
                ElMessage({message: '已添加到收藏夹', type: 'success', plain: true});
            }
            localStorage.setItem('favoriteRecipeIds', JSON.stringify(this.favoriteRecipeIds));
        },
        updateRecipeStatus({recipeId, newStatus}) {
            const recipe = this.recipes.find(r => r.id === recipeId);
            if (recipe) {
                if (['approved', 'rejected', 'pending'].includes(newStatus)) {
                    recipe.status = newStatus;
                } else {
                    console.error(`无效的状态值: ${newStatus}`);
                }
            } else {
                console.error(`在 store 中未找到 ID 为 ${recipeId} 的菜谱。`);
            }
        },
    },
});



