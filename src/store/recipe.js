import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus';
import { useGlobalStore } from './global';
import MOCK_DATA from '../utils/mock-data'; // We will create this file

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
            return state.recipes.find(r => r.id === id);
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
            if (this.recipes.length > 0) return; // Avoid re-fetching
            this.isLoading = true;
            try {
                // Simulating an API call
                await new Promise(res => setTimeout(res, 500));
                this.recipes = MOCK_DATA.recipes;
                this.comments = MOCK_DATA.comments;
            } catch (error) {
                ElMessage.error('获取食谱失败');
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
                createdAt: new Date().toISOString(),
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
                createdAt: new Date().toISOString()
            };

            if (!this.comments[recipeId]) {
                this.comments[recipeId] = [];
            }
            this.comments[recipeId].push(newComment);
            ElMessage.success('评论成功');
        },
        toggleLike(recipeId) {
            const index = this.likedRecipeIds.indexOf(recipeId);
            const recipe = this.recipes.find(r => r.id === recipeId);
            if (index > -1) {
                this.likedRecipeIds.splice(index, 1);
                if(recipe) recipe.likes--;
            } else {
                this.likedRecipeIds.push(recipeId);
                if(recipe) recipe.likes++;
                ElMessage({ message: '点赞成功!', type: 'success', plain: true });
            }
            localStorage.setItem('likedRecipeIds', JSON.stringify(this.likedRecipeIds));
        },
        toggleFavorite(recipeId) {
            const index = this.favoriteRecipeIds.indexOf(recipeId);
            const recipe = this.recipes.find(r => r.id === recipeId);
            if (index > -1) {
                this.favoriteRecipeIds.splice(index, 1);
                if(recipe) recipe.favorites--;
                ElMessage({ message: '已取消收藏', type: 'warning', plain: true });
            } else {
                this.favoriteRecipeIds.push(recipeId);
                if(recipe) recipe.favorites++;
                ElMessage({ message: '收藏成功', type: 'success', plain: true });
            }
            localStorage.setItem('favoriteRecipeIds', JSON.stringify(this.favoriteRecipeIds));
        },
    },
});