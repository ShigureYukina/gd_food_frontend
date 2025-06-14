import {defineStore} from 'pinia'
import {ElMessage} from 'element-plus';
// 假设 'global' store 用于管理全局状态，例如当前登录的用户信息
import {useGlobalStore} from './global';
// 引入我们之前创建的、带有审核状态的模拟数据
import MOCK_DATA from '../utils/mock-data';

export const useRecipeStore = defineStore("recipe", {
    state: () => ({
        // 存储所有菜谱的列表
        recipes: [],
        // 存储每个菜谱下的评论，以 recipeId 为键
        comments: {},
        // 全局加载状态，用于在数据获取时显示加载指示器
        isLoading: false,
        // 从 localStorage 中恢复用户点赞过的菜谱ID列表
        likedRecipeIds: JSON.parse(localStorage.getItem('likedRecipeIds')) || [],
        // 从 localStorage 中恢复用户收藏过的菜谱ID列表
        favoriteRecipeIds: JSON.parse(localStorage.getItem('favoriteRecipeIds')) || [],
    }),
    getters: {
        // 根据ID查找并返回单个菜谱对象
        getRecipeById: (state) => (id) => {
            // 注意：传入的ID可能是数字或字符串，因此进行统一的字符串比较
            return state.recipes.find(r => String(r.id) === String(id));
        },
        // 根据菜谱ID获取其对应的所有评论
        getCommentsByRecipeId: (state) => (recipeId) => {
            return state.comments[recipeId] || [];
        },
        // 获取当前用户收藏的所有菜谱
        favoriteRecipes: (state) => {
            return state.recipes.filter(r => state.favoriteRecipeIds.includes(r.id));
        },
        // 检查某个菜谱是否已被当前用户收藏
        isFavorite: (state) => (recipeId) => {
            return state.favoriteRecipeIds.includes(recipeId);
        },
        // 检查某个菜谱是否已被当前用户点赞
        isLiked: (state) => (recipeId) => {
            return state.likedRecipeIds.includes(recipeId);
        },
    },
    actions: {
        // 异步获取并处理所有菜谱数据
        async fetchRecipes() {
            // 如果已有数据，则不再重复获取，避免不必要的API调用
            if (this.recipes.length > 0) return;
            this.isLoading = true;
            try {
                // 模拟网络请求延迟
                await new Promise(res => setTimeout(res, 500));

                const userMap = MOCK_DATA.users.reduce((acc, user) => {
                    acc[user.UserID] = user.Username;
                    return acc;
                }, {});

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
                        authorName: userMap[recipe.UserID] || '匿名用户',
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
                        username: userMap[review.UserID] || '匿名用户',
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
            const newComment = {
                commentId: 'comment-' + Date.now(),
                recipeId,
                userId: globalStore.userId,
                username: '我',
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
        // 更新菜谱的审核状态
        updateRecipeStatus({recipeId, newStatus}) {
            const recipe = this.recipes.find(r => r.id === recipeId);
            if (recipe) {
                // 检查新状态是否有效
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
