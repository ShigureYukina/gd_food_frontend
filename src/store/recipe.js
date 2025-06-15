import {defineStore} from 'pinia';
import {ElMessage} from 'element-plus';
import {useGlobalStore} from './global';
import {recipeService} from '@/services/recipeService';
import {commentService} from '@/services/commentService';
import {likeService} from '@/services/likeService';
import {favoriteService} from '@/services/favoriteService';

export const useRecipeStore = defineStore("recipe", {
    state: () => ({
        recipes: [],
        comments: {},
        isLoading: false,
        likedRecipeIds: likeService.getLikedIds(),
        favoriteRecipeIds: favoriteService.getFavoriteIds(),
    }),
    getters: {
        getRecipeById: state => id => state.recipes.find(r => String(r.id) === String(id)),
        getCommentsByRecipeId: state => id => state.comments[id] || [],
        favoriteRecipes: state => state.recipes.filter(r => state.favoriteRecipeIds.includes(r.id)),
        isFavorite: state => recipeId => favoriteService.isFavorite(recipeId, state.favoriteRecipeIds),
        isLiked: state => recipeId => likeService.isLiked(recipeId, state.likedRecipeIds),
    },
    actions: {
        async fetchRecipes() {
            if (this.recipes.length > 0) return;
            this.isLoading = true;
            try {
                const {recipes, comments} = await recipeService.fetchRecipes();
                this.recipes = recipes;
                this.comments = comments;
            } catch (error) {
                console.error('获取或处理数据时出错:', error);
                ElMessage.error('获取菜谱数据失败，请稍后重试。');
            } finally {
                this.isLoading = false;
            }
        },

        addComment(recipeId, content) {
            const globalStore = useGlobalStore();
            const newComment = commentService.createComment(recipeId, content, globalStore.userId);
            if (!this.comments[recipeId]) {
                this.comments[recipeId] = [];
            }
            this.comments[recipeId].push(newComment);
            ElMessage.success('评论发布成功');
        },

        toggleLike(recipeId) {
            const updated = likeService.toggleLike(recipeId, this.likedRecipeIds);
            const recipe = this.recipes.find(r => r.id === recipeId);
            if (recipe) {
                recipe.likes += updated.includes(recipeId) ? 1 : -1;
            }
            this.likedRecipeIds = updated;
            ElMessage({
                message: updated.includes(recipeId) ? '已点赞！' : '已取消点赞',
                type: updated.includes(recipeId) ? 'success' : 'info',
                plain: true
            });
        },

        toggleFavorite(recipeId) {
            const updated = favoriteService.toggleFavorite(recipeId, this.favoriteRecipeIds);
            const recipe = this.recipes.find(r => r.id === recipeId);
            if (recipe) {
                recipe.favorites += updated.includes(recipeId) ? 1 : -1;
            }
            this.favoriteRecipeIds = updated;
            ElMessage({
                message: updated.includes(recipeId) ? '已添加到收藏夹' : '已从收藏夹移除',
                type: updated.includes(recipeId) ? 'success' : 'warning',
                plain: true
            });
        },

    }
});
