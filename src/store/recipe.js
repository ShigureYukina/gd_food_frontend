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
            // 注意：ID可能是数字或字符串，进行统一比较
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
            if (this.recipes.length > 0) return; // 避免重复获取
            this.isLoading = true;
            try {
                // 模拟API调用
                await new Promise(res => setTimeout(res, 500));

                // 1. 创建用户ID到用户名的映射表，提高效率
                const userMap = MOCK_DATA.users.reduce((acc, user) => {
                    acc[user.UserID] = user.Username;
                    return acc;
                }, {});

                // 2. 计算每个食谱的初始收藏数
                const favoriteCounts = MOCK_DATA.collections.reduce((acc, collection) => {
                    acc[collection.RecipeID] = (acc[collection.RecipeID] || 0) + 1;
                    return acc;
                }, {});

                // 3. 转换食谱数据
                this.recipes = MOCK_DATA.recipes.map(recipe => {
                    let coverImage = `https://placehold.co/600x400/cccccc/ffffff?text=${encodeURI(recipe.Title)}`;
                    try {
                        const images = JSON.parse(recipe.ImageLinks);
                        if (images && images.length > 0) {
                            coverImage = images[0];
                        }
                    } catch (e) {
                        console.error(`解析食谱 ${recipe.RecipeID} 的图片链接时出错:`, e);
                    }

                    return {
                        id: recipe.RecipeID,
                        title: recipe.Title,
                        description: recipe.Description,
                        ingredients: JSON.parse(recipe.Ingredients),
                        steps: JSON.parse(recipe.Steps),
                        difficulty: recipe.Difficulty,
                        createdAt: recipe.UploadTime,
                        authorId: recipe.UserID,
                        authorName: userMap[recipe.UserID] || '匿名用户',
                        coverImage: coverImage,
                        likes: Math.floor(Math.random() * 200),
                        favorites: favoriteCounts[recipe.RecipeID] || 0,
                    };
                });

                // 4. 转换评论数据
                const commentsByRecipeId = MOCK_DATA.reviews.reduce((acc, review) => {
                    const {RecipeID} = review;
                    if (!acc[RecipeID]) {
                        acc[RecipeID] = [];
                    }
                    acc[RecipeID].push({
                        commentId: review.ReviewID,
                        recipeId: review.RecipeID,
                        userId: review.UserID,
                        username: userMap[review.UserID] || '匿名用户',
                        content: review.Comment,
                        createdAt: review.ReviewTime, // MODIFIED: 直接使用 yyyy-MM-dd 格式日期字符串
                        rating: review.Rating,
                    });
                    return acc;
                }, {});
                this.comments = commentsByRecipeId;

            } catch (error) {
                console.error('获取食谱或处理数据时出错:', error);
                ElMessage.error('获取食谱数据失败，请稍后重试。');
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
                createdAt: new Date().toISOString().slice(0, 10), // MODIFIED: 生成 yyyy-MM-dd 格式日期字符串
                likes: 0,
                favorites: 0,
                coverImage: `https://placehold.co/600x400/cccccc/ffffff?text=${encodeURI(recipeData.title)}`
            };
            this.recipes.unshift(newRecipe);
            ElMessage.success('食谱分享成功！');
        },
        addComment(recipeId, commentContent) {
            const globalStore = useGlobalStore();
            const newComment = {
                commentId: 'comment-' + Date.now(),
                recipeId,
                userId: globalStore.userId,
                username: '我',
                content: commentContent,
                createdAt: new Date().toISOString().slice(0, 10), // MODIFIED: 生成 yyyy-MM-dd 格式日期字符串
            };

            if (!this.comments[recipeId]) {
                this.comments[recipeId] = [];
            }
            this.comments[recipeId].push(newComment);
            ElMessage.success('评论成功');
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
                ElMessage({message: '点赞成功!', type: 'success', plain: true});
            }
            localStorage.setItem('likedRecipeIds', JSON.stringify(this.likedRecipeIds));
        },
        toggleFavorite(recipeId) {
            const index = this.favoriteRecipeIds.indexOf(recipeId);
            const recipe = this.recipes.find(r => String(r.id) === String(recipeId));
            if (index > -1) {
                this.favoriteRecipeIds.splice(index, 1);
                if (recipe) recipe.favorites--;
                ElMessage({message: '已取消收藏', type: 'warning', plain: true});
            } else {
                this.favoriteRecipeIds.push(recipeId);
                if (recipe) recipe.favorites++;
                ElMessage({message: '收藏成功', type: 'success', plain: true});
            }
            localStorage.setItem('favoriteRecipeIds', JSON.stringify(this.favoriteRecipeIds));
        },
    },
});
