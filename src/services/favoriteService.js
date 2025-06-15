// services/favoriteService.js
import MOCK_DATA from '@/utils/mock-data';

function delay(ms = 300) {
    return new Promise(res => setTimeout(res, ms));
}

// 内存中的收藏列表（引用 MOCK_DATA.collections）
let favoriteCollections = [...MOCK_DATA.collections];

/**
 * 获取某个用户的收藏食谱ID列表
 * @param {string} userId
 * @returns {Promise<string[]>}
 */
export async function fetchFavoritesByUser(userId) {
    await delay();
    return favoriteCollections
        .filter(c => c.UserID.toString() === userId.toString())
        .map(c => c.RecipeID.toString());
}

/**
 * 切换收藏状态（收藏/取消收藏）
 * @param {string} userId
 * @param {string} recipeId
 * @returns {Promise<string[]>} 返回最新收藏食谱ID列表
 */
export async function toggleFavorite(userId, recipeId) {
    await delay();

    const index = favoriteCollections.findIndex(c => c.UserID === userId && c.RecipeID === recipeId);
    if (index > -1) {
        // 已收藏，取消收藏
        favoriteCollections.splice(index, 1);
    } else {
        // 未收藏，新增收藏
        favoriteCollections.push({
            UserID: userId,
            RecipeID: recipeId,
            CollectionTime: new Date().toISOString().slice(0, 10),
            Notes: null,
        });
    }

    return favoriteCollections
        .filter(c => c.UserID === userId)
        .map(c => c.RecipeID);
}

/**
 * 判断某用户是否已收藏某个食谱
 * @param {string|number} userId
 * @param {string|number} recipeId
 * @returns {boolean}
 */
function isFavorite(userId, recipeId) {
    return favoriteCollections.some(c => c.UserID == userId && c.RecipeID == recipeId);
}

export const favoriteService = {
    fetchFavoritesByUser,
    toggleFavorite,
    isFavorite
};
